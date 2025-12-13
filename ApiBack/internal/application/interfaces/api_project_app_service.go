package interfaces

import (
	"ApiBack/internal/application/command"
	"ApiBack/internal/application/query"
)

type ApiProjectAppService interface {
	// 创建项目
	CreateApiProject(cmd *command.CreateApiProjectCmd) error

	// 查询项目列表
	QueryApiProjects(q *query.ApiProjectQuery) ([]*query.ApiProjectQueryResult, int64, error)
}
