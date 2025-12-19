package command

type CreateApiInfoCmd struct {
	ID                 int64  `json:"id"`
	ProjectID          int64  `json:"project_id"`
	Path               string `json:"path"`
	Method             string `json:"method"`
	Title              string `json:"title"`
	ReqSchema          string `json:"req_schema"`
	RespSchema         string `json:"resp_schema"`
	Version            string `json:"version"`
	Description        string `json:"description"`
	Editor             string `json:"editor"`
	Creator            string `json:"creator"`
	MockData           string `json:"mock_data"`
	IsUpdateRespSchema bool   `json:"is_update_resp_schema"`
}
