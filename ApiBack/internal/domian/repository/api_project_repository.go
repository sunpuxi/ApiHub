package repository

import "ApiBack/internal/infrastruction/model"

type ApiProjectRepository interface {
	// 创建项目
	CreateApiProject(project *model.ApiProjectDO) error

	// 查询项目列表（支持分页和条件查询）
	QueryApiProjects(filter *ApiProjectFilter) ([]*model.ApiProjectDO, int64, error)
}
