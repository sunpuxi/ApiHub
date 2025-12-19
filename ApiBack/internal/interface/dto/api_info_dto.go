package dto

import "ApiBack/internal/application/command"

type CreateApiInfoDto struct {
	ID                 int64  `json:"id"`
	ProjectID          int64  `json:"project_id" binding:"required"`
	Path               string `json:"path" binding:"required"`
	Method             string `json:"method" binding:"required"`
	Title              string `json:"title" binding:"required"`
	ReqSchema          string `json:"req_schema"`
	RespSchema         string `json:"resp_schema"`
	Version            string `json:"version" binding:"required"`
	Description        string `json:"description"`
	Editor             string `json:"editor" binding:"required"`
	Creator            string `json:"creator" binding:"required"`
	MockData           string `json:"mock_data"`
	IsUpdateRespSchema bool   `json:"is_update_resp_schema"`
}

func (d *CreateApiInfoDto) ToCreateApiInfoCmd() *command.CreateApiInfoCmd {
	return &command.CreateApiInfoCmd{
		ID:                 d.ID,
		ProjectID:          d.ProjectID,
		Path:               d.Path,
		Method:             d.Method,
		Title:              d.Title,
		ReqSchema:          d.ReqSchema,
		RespSchema:         d.RespSchema,
		Version:            d.Version,
		Description:        d.Description,
		Editor:             d.Editor,
		Creator:            d.Creator,
		MockData:           d.MockData,
		IsUpdateRespSchema: d.IsUpdateRespSchema,
	}
}

type ApiProjectQueryReq struct {
	Id            int64  `form:"id" json:"id"`
	ProjectNameID string `form:"project_name_id" json:"project_name_id"`
	Page          int    `form:"page" json:"page"`
	PageSize      int    `form:"page_size" json:"page_size"`
}

type ApiInfoQueryReq struct {
	Id            int64  `form:"id" json:"id"`
	ProjectID     int64  `form:"project_id" json:"project_id"`
	Path          string `form:"path" json:"path"`
	Method        string `form:"method" json:"method"`
	InterfaceName string `form:"interface_name" json:"interface_name"`
	Page          int    `form:"page" json:"page"`
	PageSize      int    `form:"page_size" json:"page_size"`
}
