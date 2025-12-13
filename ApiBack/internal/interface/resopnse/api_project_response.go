package resopnse

import "time"

type ApiProjectResponse struct {
	Items []ApiProjectItem `json:"items"`
	Total int64            `json:"total"`
}

type ApiProjectItem struct {
	ProjectID   string    `json:"project_id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	CTime       time.Time `json:"ctime"`
	MTime       time.Time `json:"mtime"`
	IsDel       bool      `json:"is_del"`
	Editor      string    `json:"editor"`
	Creator     string    `json:"creator"`
}
