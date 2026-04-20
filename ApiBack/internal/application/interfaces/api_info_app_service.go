package interfaces

import (
	"ApiBack/internal/application/command"
	"ApiBack/internal/application/query"
)

type ApiInfoAppService interface {
	// CreateApiInfo 创建接口
	CreateApiInfo(cmd *command.CreateApiInfoCmd) (*command.CreateApiInfoResult, error)

	// QueryApiInfos 查询接口列表
	QueryApiInfos(q *query.ApiInfoQuery) ([]*query.ApiInfoQueryResult, int64, error)
}
