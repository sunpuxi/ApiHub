package interfaces

import "ApiBack/internal/application/command"

type ApiProjectAppService interface {

	// 创建项目
	CreateApiProject(cmd *command.CreateApiProjectCmd) error
}
