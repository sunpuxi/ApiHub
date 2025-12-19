package query

import "time"

type ApiInfoQuery struct {
	Id            int64  `json:"id"`
	ProjectID     int64  `json:"project_id"`
	Path          string `json:"path"`
	Method        string `json:"method"`
	InterfaceName string `json:"interface_name"`
	Page          int    `json:"page"`
	PageSize      int    `json:"page_size"`
}

type ApiInfoQueryResult struct {
	Id          int64     `json:"id"`
	ProjectID   int64     `json:"project_id"`
	Path        string    `json:"path"`
	Method      string    `json:"method"`
	ApiNameID   string    `json:"api_name_id"`
	Title       string    `json:"title"`
	ReqSchema   string    `json:"req_schema"`
	RespSchema  string    `json:"resp_schema"`
	Version     string    `json:"version"`
	Description string    `json:"description"`
	CTime       time.Time `json:"ctime"`
	MTime       time.Time `json:"mtime"`
	IsDel       bool      `json:"is_del"`
	Editor      string    `json:"editor"`
	Creator     string    `json:"creator"`
	MockData    string    `json:"mock_data"`
}
