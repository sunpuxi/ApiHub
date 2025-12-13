package dto

import "ApiBack/internal/application/command"

type CreateApiProjectRespDto struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Editor      string `json:"editor"`
	Creator     string `json:"creator"`
}

func (d *CreateApiProjectRespDto) ToCreateApiProjectCmd() *command.CreateApiProjectCmd {
	return &command.CreateApiProjectCmd{
		Name:        d.Name,
		Description: d.Description,
		Editor:      d.Editor,
		Creator:     d.Creator,
	}
}
