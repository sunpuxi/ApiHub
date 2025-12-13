package mapper

import (
	"ApiBack/internal/application/command"
	"ApiBack/internal/domian/entity"
)

func ToApiInfoEntity(cmd *command.CreateApiInfoCmd) *entity.ApiInfo {
	return &entity.ApiInfo{
		ProjectID:   cmd.ProjectID,
		Path:        cmd.Path,
		Method:      cmd.Method,
		Title:       cmd.Title,
		ReqSchema:   cmd.ReqSchema,
		RespSchema:  cmd.RespSchema,
		Version:     cmd.Version,
		Description: cmd.Description,
		Editor:      cmd.Editor,
		Creator:     cmd.Creator,
	}
}
