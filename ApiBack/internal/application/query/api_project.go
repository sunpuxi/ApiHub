package query

import "time"

type ApiProjectQuery struct {
	Id            int64  `json:"id"`
	ProjectNameID string `json:"project_name_id"`
	Page          int    `json:"page"`
	PageSize      int    `json:"page_size"`
}

type ApiProjectQueryResult struct {
	Id          int64     `json:"id"`
	ProjectID   string    `json:"project_id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	CTime       time.Time `json:"ctime"`
	MTime       time.Time `json:"mtime"`
	IsDel       bool      `json:"is_del"`
	Editor      string    `json:"editor"`
	Creator     string    `json:"creator"`
}
