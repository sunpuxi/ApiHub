package dto

import "ApiBack/internal/application/command"

type CreateApiInfoDto struct {
	ProjectID   int64  `json:"project_id" binding:"required"`
	Path        string `json:"path" binding:"required"`
	Method      string `json:"method" binding:"required"`
	Title       string `json:"title" binding:"required"`
	ReqSchema   string `json:"req_schema"`
	RespSchema  string `json:"resp_schema"`
	Version     string `json:"version" binding:"required"`
	Description string `json:"description"`
	Editor      string `json:"editor" binding:"required"`
	Creator     string `json:"creator" binding:"required"`
}

func (d *CreateApiInfoDto) ToCreateApiInfoCmd() *command.CreateApiInfoCmd {
	return &command.CreateApiInfoCmd{
		ProjectID:   d.ProjectID,
		Path:        d.Path,
		Method:      d.Method,
		Title:       d.Title,
		ReqSchema:   d.ReqSchema,
		RespSchema:  d.RespSchema,
		Version:     d.Version,
		Description: d.Description,
		Editor:      d.Editor,
		Creator:     d.Creator,
	}
}
