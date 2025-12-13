package interfaces

import "ApiBack/internal/application/command"

type ApiInfoAppService interface {
	// 创建接口
	CreateApiInfo(cmd *command.CreateApiInfoCmd) error
}
