package command

type CreateApiInfoCmd struct {
	ProjectID   int64  `json:"project_id"`
	Path        string `json:"path"`
	Method      string `json:"method"`
	Title       string `json:"title"`
	ReqSchema   string `json:"req_schema"`
	RespSchema  string `json:"resp_schema"`
	Version     string `json:"version"`
	Description string `json:"description"`
	Editor      string `json:"editor"`
	Creator     string `json:"creator"`
}
