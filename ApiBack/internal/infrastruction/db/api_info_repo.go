package db

import (
	"ApiBack/internal/domian/repository"
	"ApiBack/internal/infrastruction/model"

	"gorm.io/gorm"
)

const (
	apiInfoTableName = "api_info"
)

type ApiInfoRepo struct {
	db *gorm.DB
}

func NewApiInfoRepo(db *gorm.DB) repository.ApiInfoRepository {
	return &ApiInfoRepo{db: db}
}

func (r *ApiInfoRepo) CreateApiInfo(apiInfo *model.ApiInfoDO) error {
	return r.db.Table(apiInfoTableName).Create(apiInfo).Error
}

func (r *ApiInfoRepo) QueryApiInfos(filter *repository.ApiInfoFilter) ([]*model.ApiInfoDO, int64, error) {
	var apiInfos []*model.ApiInfoDO
	var total int64

	query := r.db.Table(apiInfoTableName).Where("is_del = ?", false)

	if filter.Id > 0 {
		query = query.Where("id = ?", filter.Id)
	}
	if filter.ProjectID > 0 {
		query = query.Where("project_id = ?", filter.ProjectID)
	}
	if filter.Path != "" {
		query = query.Where("path LIKE ?", "%"+filter.Path+"%")
	}
	if filter.Method != "" {
		query = query.Where("method = ?", filter.Method)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	page := filter.Page
	if page < 1 {
		page = 1
	}
	pageSize := filter.PageSize
	if pageSize < 1 {
		pageSize = 10
	}
	offset := (page - 1) * pageSize

	if err := query.Offset(offset).Limit(pageSize).Find(&apiInfos).Error; err != nil {
		return nil, 0, err
	}

	return apiInfos, total, nil
}
