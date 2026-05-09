package repository

import (
	"ApiBack/internal/infrastructure/model"

	"gorm.io/gorm"
)

type ApiInfoRepository interface {
	// CreateApiInfo 创建接口
	CreateApiInfo(apiInfo *model.ApiInfoDO) error

	// CreateApiInfoTx 在指定事务内创建或更新接口（与 CreateApiInfo 规则一致）
	CreateApiInfoTx(tx *gorm.DB, apiInfo *model.ApiInfoDO) error

	// GetApiInfoByID 按主键查询未删除记录
	GetApiInfoByID(id int64) (*model.ApiInfoDO, error)

	// SetMockGenerationRunning 仅更新状态为 running（不修改 mock_data）
	SetMockGenerationRunning(id int64) error

	// SetMockGenerationOutcome 更新 mock 与生成状态；mockData 为 nil 时不改 mock_data 列；errMsg 为 nil 时将错误列置空。
	SetMockGenerationOutcome(id int64, mockData *string, status string, errMsg *string) error

	// QueryApiInfos 查询接口列表（支持分页和条件查询）
	QueryApiInfos(filter *ApiInfoFilter) ([]*model.ApiInfoDO, int64, error)
}

type ApiProjectFilter struct {
	Id            int64  `json:"id"`
	ProjectNameID string `json:"project_name_id"`
	Name          string `json:"name"`
	Page          int    `json:"page"`
	PageSize      int    `json:"page_size"`
}

type ApiInfoFilter struct {
	Id            int64  `json:"id"`
	ProjectID     int64  `json:"project_id"`
	Path          string `json:"path"`
	Method        string `json:"method"`
	InterfaceName string `json:"interface_name"`
	Page          int    `json:"page"`
	PageSize      int    `json:"page_size"`
}
