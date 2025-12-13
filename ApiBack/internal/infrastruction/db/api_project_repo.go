package db

import (
	"ApiBack/internal/domian/repository"
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

func (r *ApiProjectRepo) QueryApiProjects(filter *repository.ApiProjectFilter) ([]*model.ApiProjectDO, int64, error) {
	var projects []*model.ApiProjectDO
	var total int64

	query := r.db.Table(apiProjectTableName).Where("is_del = ?", false)

	if filter.Id > 0 {
		query = query.Where("id = ?", filter.Id)
	}
	if filter.ProjectNameID != "" {
		query = query.Where("project_name_id = ?", filter.ProjectNameID)
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

	if err := query.Offset(offset).Limit(pageSize).Find(&projects).Error; err != nil {
		return nil, 0, err
	}

	return projects, total, nil
}
