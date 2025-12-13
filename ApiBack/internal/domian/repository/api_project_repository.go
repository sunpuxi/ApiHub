package repository

import "ApiBack/internal/infrastruction/model"

type ApiProjectRepository interface {
	// 创建项目
	CreateApiProject(project *model.ApiProjectDO) error
}
