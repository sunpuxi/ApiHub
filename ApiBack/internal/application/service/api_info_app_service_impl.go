package service

import (
	"ApiBack/common/config"
	"ApiBack/internal/application/command"
	"ApiBack/internal/application/interfaces"
	"ApiBack/internal/application/mapper"
	"ApiBack/internal/application/query"
	"ApiBack/internal/domian/entity"
	"ApiBack/internal/domian/repository"
	domainService "ApiBack/internal/domian/service"
	"ApiBack/internal/infrastructure/model"
	"encoding/json"
	"fmt"
	"log"

	"gorm.io/gorm"
)

type ApiInfoAppServiceImpl struct {
	apiInfoService  *domainService.ApiInfoService
	asyncTaskRepo   repository.AsyncTaskRepository
	db              *gorm.DB
	asyncWorkerConf config.AsyncWorkerConfig
}

func NewApiInfoAppServiceImpl(
	apiInfoService *domainService.ApiInfoService,
	asyncTaskRepo repository.AsyncTaskRepository,
	db *gorm.DB,
	asyncWorkerConf config.AsyncWorkerConfig,
) interfaces.ApiInfoAppService {
	return &ApiInfoAppServiceImpl{
		apiInfoService:  apiInfoService,
		asyncTaskRepo:   asyncTaskRepo,
		db:              db,
		asyncWorkerConf: asyncWorkerConf,
	}
}

func (s *ApiInfoAppServiceImpl) CreateApiInfo(cmd *command.CreateApiInfoCmd) (*command.CreateApiInfoResult, error) {
	apiInfo := mapper.ToApiInfoEntity(cmd)

	needAsync := ((cmd.ID == 0 && apiInfo.MockData == "") || cmd.IsUpdateRespSchema) && apiInfo.RespSchema != ""
	if needAsync {
		apiInfo.MockGenerationStatus = model.MockGenStatusPending
		apiInfo.MockGenerationError = ""
	} else {
		apiInfo.MockGenerationStatus = model.MockGenStatusSkipped
		apiInfo.MockGenerationError = ""
	}

	validateApiInfo, err := entity.NewValidateApiInfo(apiInfo)
	if err != nil {
		log.Println("接口验证失败", err)
		return nil, fmt.Errorf("接口验证失败: %v", err)
	}

	err = s.db.Transaction(func(tx *gorm.DB) error {
		if err := s.apiInfoService.CreateApiInfoTx(tx, validateApiInfo.ApiInfo); err != nil {
			log.Println("接口创建失败", err)
			return err
		}
		if !needAsync {
			return nil
		}
		idem := fmt.Sprintf("%s:api_info:%d", model.TaskTypeGenerateAPIMock, validateApiInfo.ApiInfo.Id)
		payload, err := json.Marshal(map[string]int64{"api_info_id": validateApiInfo.ApiInfo.Id})
		if err != nil {
			return err
		}
		task := &model.AsyncTaskDO{
			TaskType:       model.TaskTypeGenerateAPIMock,
			Payload:        string(payload),
			Status:         model.TaskStatusPending,
			IdempotencyKey: idem,
			Attempts:       0,
			MaxAttempts:    s.asyncWorkerConf.MaxAttempts,
		}
		_, err = s.asyncTaskRepo.CreatePendingIfAbsent(tx, task)
		return err
	})
	if err != nil {
		return nil, fmt.Errorf("接口创建失败: %v", err)
	}

	return &command.CreateApiInfoResult{
		ID:                   validateApiInfo.ApiInfo.Id,
		MockGenerationStatus: validateApiInfo.ApiInfo.MockGenerationStatus,
	}, nil
}

func (s *ApiInfoAppServiceImpl) QueryApiInfos(q *query.ApiInfoQuery) ([]*query.ApiInfoQueryResult, int64, error) {
	filter := mapper.ToApiInfoFilter(q)
	apiInfos, total, err := s.apiInfoService.QueryApiInfos(filter)
	if err != nil {
		log.Println("接口查询失败", err)
		return nil, 0, fmt.Errorf("接口查询失败: %v", err)
	}
	results := mapper.ToApiInfoQueryResultList(apiInfos)
	return results, total, nil
}
