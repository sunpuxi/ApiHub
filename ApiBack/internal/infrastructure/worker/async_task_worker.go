package worker

import (
	"ApiBack/common/config"
	"ApiBack/internal/domian/entity"
	"ApiBack/internal/domian/repository"
	domainService "ApiBack/internal/domian/service"
	"ApiBack/internal/infrastructure/model"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"math"
	"os"
	"strings"
	"time"

	"gorm.io/gorm"
)

type generateMockPayload struct {
	ApiInfoID int64 `json:"api_info_id"`
}

type AsyncTaskWorker struct {
	asyncRepo   repository.AsyncTaskRepository
	apiInfoRepo repository.ApiInfoRepository
	gptService  *domainService.GPTService
	cfg         config.AsyncWorkerConfig
	owner       string
}

func NewAsyncTaskWorker(
	asyncRepo repository.AsyncTaskRepository,
	apiInfoRepo repository.ApiInfoRepository,
	gptService *domainService.GPTService,
	cfg config.AsyncWorkerConfig,
) *AsyncTaskWorker {
	host, _ := os.Hostname()
	owner := fmt.Sprintf("%s-%d-%d", host, os.Getpid(), time.Now().UnixNano())
	return &AsyncTaskWorker{
		asyncRepo:   asyncRepo,
		apiInfoRepo: apiInfoRepo,
		gptService:  gptService,
		cfg:         cfg,
		owner:       owner,
	}
}

func (w *AsyncTaskWorker) Run(ctx context.Context) {
	interval := time.Duration(w.cfg.IntervalSeconds) * time.Second
	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	log.Printf("async_task worker started, owner=%s interval=%s", w.owner, interval)

	for {
		select {
		case <-ctx.Done():
			log.Println("async_task worker stopped")
			return
		case <-ticker.C:
			w.tick(ctx)
		}
	}
}

func (w *AsyncTaskWorker) tick(ctx context.Context) {
	now := time.Now()
	if err := w.asyncRepo.RecoverExpiredLeases(now); err != nil {
		log.Printf("async_task RecoverExpiredLeases: %v", err)
		return
	}

	for i := 0; i < w.cfg.BatchSize; i++ {
		task, err := w.asyncRepo.ClaimNext(w.owner, time.Duration(w.cfg.LeaseMinutes)*time.Minute)
		if err != nil {
			log.Printf("async_task ClaimNext: %v", err)
			return
		}
		if task == nil {
			return
		}
		w.handleTask(ctx, task)
	}
}

func (w *AsyncTaskWorker) handleTask(ctx context.Context, task *model.AsyncTaskDO) {
	switch task.TaskType {
	case model.TaskTypeGenerateAPIMock:
		w.handleGenerateAPIMock(ctx, task)
	default:
		msg := fmt.Sprintf("unknown task_type: %s", task.TaskType)
		_ = w.asyncRepo.MarkFailedFinal(task.Id, msg)
	}
}

func (w *AsyncTaskWorker) handleGenerateAPIMock(ctx context.Context, task *model.AsyncTaskDO) {
	var p generateMockPayload
	if err := json.Unmarshal([]byte(task.Payload), &p); err != nil || p.ApiInfoID <= 0 {
		_ = w.asyncRepo.MarkFailedFinal(task.Id, "invalid payload")
		return
	}

	apiRow, err := w.apiInfoRepo.GetApiInfoByID(p.ApiInfoID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			_ = w.asyncRepo.MarkFailedFinal(task.Id, "api_info not found")
			return
		}
		w.onGPTError(task, p.ApiInfoID, err)
		return
	}
	if apiRow.RespSchema == "" {
		_ = w.asyncRepo.MarkFailedFinal(task.Id, "resp_schema empty")
		msg := "resp_schema 为空"
		_ = w.apiInfoRepo.SetMockGenerationOutcome(p.ApiInfoID, nil, model.MockGenStatusFailed, &msg)
		return
	}

	if err := w.apiInfoRepo.SetMockGenerationRunning(p.ApiInfoID); err != nil {
		log.Printf("SetMockGenerationRunning id=%d: %v", p.ApiInfoID, err)
	}

	req := &entity.GPTRequest{
		Role:   "你是一个专业的后端开发工程师和 JSON 专家。",
		Prompt: "请根据我提供的 JSON Schema，生成一份符合该结构的 JSON Mock 数据。要求：1. 只返回 JSON 内容本身，不要有任何 Markdown 代码块标签或其他解释文字。2. 字段值要尽量真实且多样化。",
		Input:  fmt.Sprintf("JSON Schema 内容如下：\n%s", apiRow.RespSchema),
	}
	resp, err := w.gptService.Generate(ctx, req)
	if err != nil {
		w.onGPTError(task, p.ApiInfoID, err)
		return
	}
	if resp == nil || resp.Content == "" {
		w.onGPTError(task, p.ApiInfoID, fmt.Errorf("empty gpt response"))
		return
	}

	if err := w.apiInfoRepo.SetMockGenerationOutcome(p.ApiInfoID, &resp.Content, model.MockGenStatusSuccess, nil); err != nil {
		log.Printf("SetMockGenerationOutcome success id=%d: %v", p.ApiInfoID, err)
	}
	if err := w.asyncRepo.MarkSuccess(task.Id); err != nil {
		log.Printf("MarkSuccess task=%d: %v", task.Id, err)
	}
}

func (w *AsyncTaskWorker) onGPTError(task *model.AsyncTaskDO, apiInfoID int64, execErr error) {
	msg := truncate(execErr.Error(), 512)
	retryable := isRetryableGPTError(execErr)
	final := !retryable || task.Attempts+1 >= task.MaxAttempts
	if final {
		_ = w.asyncRepo.MarkFailedFinal(task.Id, msg)
		_ = w.apiInfoRepo.SetMockGenerationOutcome(apiInfoID, nil, model.MockGenStatusFailed, &msg)
		return
	}
	next := time.Now().Add(retryBackoff(task.Attempts))
	if err := w.asyncRepo.ScheduleRetry(task.Id, msg, next); err != nil {
		log.Printf("ScheduleRetry task=%d: %v", task.Id, err)
	}
	hint := msg + "（将重试）"
	_ = w.apiInfoRepo.SetMockGenerationOutcome(apiInfoID, nil, model.MockGenStatusPending, &hint)
}

func retryBackoff(attempts int) time.Duration {
	// attempts 为当前库中值，失败后将 +1；这里用 attempts+1 估算退避阶梯
	step := attempts + 1
	sec := math.Pow(2, float64(step))
	if sec > 300 {
		sec = 300
	}
	if sec < 5 {
		sec = 5
	}
	return time.Duration(sec) * time.Second
}

func isRetryableGPTError(err error) bool {
	if err == nil {
		return false
	}
	s := strings.ToLower(err.Error())
	if strings.Contains(s, "401") || strings.Contains(s, "unauthorized") || strings.Contains(s, "403") || strings.Contains(s, "invalid api") {
		return false
	}
	if strings.Contains(s, "400") && strings.Contains(s, "invalid") {
		return false
	}
	return strings.Contains(s, "429") ||
		strings.Contains(s, "500") ||
		strings.Contains(s, "502") ||
		strings.Contains(s, "503") ||
		strings.Contains(s, "504") ||
		strings.Contains(s, "timeout") ||
		strings.Contains(s, "connection reset") ||
		strings.Contains(s, "eof") ||
		strings.Contains(s, "context deadline exceeded")
}

func truncate(s string, max int) string {
	if len(s) <= max {
		return s
	}
	return s[:max]
}
