package db

import (
	"ApiBack/internal/infrastruction/model"

	"gorm.io/gorm"
)

const (
	apiProjectTableName = "project"
)

type ApiProjectRepo struct {
	db *gorm.DB
}

func NewApiProjectRepo(db *gorm.DB) *ApiProjectRepo {
	return &ApiProjectRepo{db: db}
}

func (r *ApiProjectRepo) CreateApiProject(project *model.ApiProjectDO) error {
	return r.db.Table(apiProjectTableName).Create(project).Error
}
