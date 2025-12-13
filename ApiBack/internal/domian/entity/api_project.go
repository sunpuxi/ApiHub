package entity

import (
	"errors"
	"time"
)

type ApiProject struct {
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

func (a *ApiProject) validate() error {
	if a.Name == "" {
		return errors.New("项目名称不能为空")
	}
	if a.Description == "" {
		return errors.New("项目描述不能为空")
	}
	if a.Editor == "" {
		return errors.New("编辑者不能为空")
	}
	if a.Creator == "" {
		return errors.New("创建者不能为空")
	}
	return nil
}

type ValidateApiProject struct {
	ApiProject *ApiProject
	Validate   bool
}

func NewValidateApiProject(apiProject *ApiProject) (*ValidateApiProject, error) {
	err := apiProject.validate()
	if err != nil {
		return nil, err
	}
	return &ValidateApiProject{ApiProject: apiProject, Validate: true}, nil
}
