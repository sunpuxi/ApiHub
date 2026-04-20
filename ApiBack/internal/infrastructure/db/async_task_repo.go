package db

import (
	"ApiBack/internal/domian/repository"
	"ApiBack/internal/infrastructure/model"
	"encoding/json"
	"errors"
	"time"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

var errNoAsyncTask = errors.New("no pending async task")

type AsyncTaskRepo struct {
	db          *gorm.DB
	apiInfoRepo repository.ApiInfoRepository
}

func NewAsyncTaskRepo(db *gorm.DB, apiInfoRepo repository.ApiInfoRepository) repository.AsyncTaskRepository {
	return &AsyncTaskRepo{db: db, apiInfoRepo: apiInfoRepo}
}

func (r *AsyncTaskRepo) dbOr(tx *gorm.DB) *gorm.DB {
	if tx != nil {
		return tx
	}
	return r.db
}

func (r *AsyncTaskRepo) CreatePendingIfAbsent(tx *gorm.DB, row *model.AsyncTaskDO) (bool, error) {
	db := r.dbOr(tx)
	var n int64
	err := db.Model(&model.AsyncTaskDO{}).
		Where("idempotency_key = ? AND status IN ?", row.IdempotencyKey, []string{model.TaskStatusPending, model.TaskStatusRunning}).
		Count(&n).Error
	if err != nil {
		return false, err
	}
	if n > 0 {
		return false, nil
	}
	if err := db.Create(row).Error; err != nil {
		return false, err
	}
	return true, nil
}

func (r *AsyncTaskRepo) RecoverExpiredLeases(now time.Time) error {
	var stuck []model.AsyncTaskDO
	if err := r.db.Where("status = ? AND lease_expire_at IS NOT NULL AND lease_expire_at < ?", model.TaskStatusRunning, now).
		Find(&stuck).Error; err != nil {
		return err
	}
	for i := range stuck {
		t := &stuck[i]
		nextAttempts := t.Attempts + 1
		if nextAttempts >= t.MaxAttempts {
			msg := truncateErr("执行超时（租约过期）", 512)
			if err := r.db.Model(t).Updates(map[string]interface{}{
				"status":          model.TaskStatusFailed,
				"attempts":        nextAttempts,
				"lease_owner":     nil,
				"lease_expire_at": nil,
				"last_error":      msg,
				"finished_at":     now,
				"next_retry_at":   nil,
			}).Error; err != nil {
				return err
			}
			r.syncApiInfoOnTaskTerminal(t, model.MockGenStatusFailed, msg)
			continue
		}
		if err := r.db.Model(t).Updates(map[string]interface{}{
			"status":          model.TaskStatusPending,
			"attempts":        nextAttempts,
			"lease_owner":     nil,
			"lease_expire_at": nil,
			"last_error":      truncateErr("租约过期，将重试", 512),
		}).Error; err != nil {
			return err
		}
	}
	return nil
}

func truncateErr(s string, max int) string {
	if len(s) <= max {
		return s
	}
	return s[:max]
}

func (r *AsyncTaskRepo) syncApiInfoOnTaskTerminal(task *model.AsyncTaskDO, apiStatus string, errMsg string) {
	if r.apiInfoRepo == nil || task.TaskType != model.TaskTypeGenerateAPIMock {
		return
	}
	var p struct {
		ApiInfoID int64 `json:"api_info_id"`
	}
	if err := json.Unmarshal([]byte(task.Payload), &p); err != nil || p.ApiInfoID <= 0 {
		return
	}
	msg := errMsg
	_ = r.apiInfoRepo.SetMockGenerationOutcome(p.ApiInfoID, nil, apiStatus, &msg)
}

func (r *AsyncTaskRepo) ClaimNext(owner string, lease time.Duration) (*model.AsyncTaskDO, error) {
	var claimed *model.AsyncTaskDO
	err := r.db.Transaction(func(tx *gorm.DB) error {
		var task model.AsyncTaskDO
		err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
			Where("status = ? AND (next_retry_at IS NULL OR next_retry_at <= ?)", model.TaskStatusPending, time.Now()).
			Order("id ASC").
			First(&task).Error
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return errNoAsyncTask
			}
			return err
		}
		now := time.Now()
		exp := now.Add(lease)
		ownerCopy := owner
		if err := tx.Model(&task).Updates(map[string]interface{}{
			"status":          model.TaskStatusRunning,
			"lease_owner":     ownerCopy,
			"lease_expire_at": exp,
			"started_at":      now,
		}).Error; err != nil {
			return err
		}
		task.Status = model.TaskStatusRunning
		task.LeaseOwner = &ownerCopy
		task.LeaseExpireAt = &exp
		task.StartedAt = &now
		claimed = &task
		return nil
	})
	if err != nil {
		if errors.Is(err, errNoAsyncTask) {
			return nil, nil
		}
		return nil, err
	}
	return claimed, nil
}

func (r *AsyncTaskRepo) MarkSuccess(id int64) error {
	now := time.Now()
	return r.db.Model(&model.AsyncTaskDO{}).Where("id = ?", id).Updates(map[string]interface{}{
		"status":          model.TaskStatusSuccess,
		"finished_at":     now,
		"lease_owner":     nil,
		"lease_expire_at": nil,
		"last_error":      nil,
	}).Error
}

func (r *AsyncTaskRepo) MarkFailedFinal(id int64, lastError string) error {
	now := time.Now()
	return r.db.Model(&model.AsyncTaskDO{}).Where("id = ?", id).Updates(map[string]interface{}{
		"status":          model.TaskStatusFailed,
		"finished_at":     now,
		"lease_owner":     nil,
		"lease_expire_at": nil,
		"last_error":      truncateErr(lastError, 512),
		"next_retry_at":   nil,
	}).Error
}

func (r *AsyncTaskRepo) ScheduleRetry(id int64, lastError string, nextRetryAt time.Time) error {
	return r.db.Model(&model.AsyncTaskDO{}).Where("id = ?", id).Updates(map[string]interface{}{
		"status":          model.TaskStatusPending,
		"lease_owner":     nil,
		"lease_expire_at": nil,
		"last_error":      truncateErr(lastError, 512),
		"next_retry_at":   nextRetryAt,
		"attempts":        gorm.Expr("attempts + 1"),
	}).Error
}
