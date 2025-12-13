package db

import (
	"ApiBack/internal/infrastruction/model"

	"gorm.io/gorm"
)

const (
	apiInfoTableName = "api_info"
)

type ApiInfoRepo struct {
	db *gorm.DB
}

func NewApiInfoRepo(db *gorm.DB) *ApiInfoRepo {
	return &ApiInfoRepo{db: db}
}

func (r *ApiInfoRepo) CreateApiInfo(apiInfo *model.ApiInfoDO) error {
	return r.db.Table(apiInfoTableName).Create(apiInfo).Error
}
