package mapper

import (
	"ApiBack/internal/application/command"
	"ApiBack/internal/domian/entity"
)

func ToApiProjectEntity(cmd *command.CreateApiProjectCmd) *entity.ApiProject {
	return &entity.ApiProject{
		Name:        cmd.Name,
		Description: cmd.Description,
		Editor:      cmd.Editor,
		Creator:     cmd.Creator,
	}
}
