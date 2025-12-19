package repository

import "ApiBack/internal/infrastructure/model"

type ApiInfoRepository interface {
	// 创建接口
	CreateApiInfo(apiInfo *model.ApiInfoDO) error

	// 查询接口列表（支持分页和条件查询）
	QueryApiInfos(filter *ApiInfoFilter) ([]*model.ApiInfoDO, int64, error)
}

type ApiProjectFilter struct {
	Id            int64  `json:"id"`
	ProjectNameID string `json:"project_name_id"`
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
