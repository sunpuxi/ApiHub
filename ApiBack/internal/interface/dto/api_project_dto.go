package dto

import "ApiBack/internal/application/command"

type CreateApiProjectRespDto struct {
	ID          int64  `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Editor      string `json:"editor"`
	Creator     string `json:"creator"`
}

func (d *CreateApiProjectRespDto) ToCreateApiProjectCmd() *command.CreateApiProjectCmd {
	return &command.CreateApiProjectCmd{
		ID:          d.ID,
		Name:        d.Name,
		Description: d.Description,
		Editor:      d.Editor,
		Creator:     d.Creator,
	}
}
