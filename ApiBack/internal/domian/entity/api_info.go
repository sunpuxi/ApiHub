package entity

import (
	"errors"
	"time"
)

type ApiInfo struct {
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

func (a *ApiInfo) validate() error {
	if a.ProjectID <= 0 {
		return errors.New("项目ID不能为空")
	}
	if a.Path == "" {
		return errors.New("接口路径不能为空")
	}
	if a.Method == "" {
		return errors.New("接口方法不能为空")
	}
	if a.Title == "" {
		return errors.New("接口标题不能为空")
	}
	if a.Version == "" {
		return errors.New("接口版本不能为空")
	}
	if a.Editor == "" {
		return errors.New("编辑者不能为空")
	}
	if a.Creator == "" {
		return errors.New("创建者不能为空")
	}
	return nil
}

type ValidateApiInfo struct {
	ApiInfo  *ApiInfo
	Validate bool
}

func NewValidateApiInfo(apiInfo *ApiInfo) (*ValidateApiInfo, error) {
	err := apiInfo.validate()
	if err != nil {
		return nil, err
	}
	return &ValidateApiInfo{ApiInfo: apiInfo, Validate: true}, nil
}
