package db

import (
	"ApiBack/internal/domian/repository"
	"ApiBack/internal/infrastructure/model"

	"gorm.io/gorm"
)

const (
	apiProjectTableName = "project"
)

type ApiProjectRepo struct {
	db *gorm.DB
}

func NewApiProjectRepo(db *gorm.DB) repository.ApiProjectRepository {
	return &ApiProjectRepo{db: db}
}

func (r *ApiProjectRepo) CreateApiProject(project *model.ApiProjectDO) error {
	return r.db.Table(apiProjectTableName).Create(project).Error
}

func (r *ApiProjectRepo) UpdateApiProject(project *model.ApiProjectDO) error {
	return r.db.Table(apiProjectTableName).Where("id = ?", project.Id).Updates(project).Error
}

func (r *ApiProjectRepo) QueryApiProjects(filter *repository.ApiProjectFilter) ([]*model.ApiProjectDO, int64, error) {
	var projects []*model.ApiProjectDO
	var total int64

	query := r.db.Table(apiProjectTableName).Where("is_del = ?", 0)

	if filter.Id > 0 {
		query = query.Where("id = ?", filter.Id)
	}
	if filter.ProjectNameID != "" {
		query = query.Where("project_name_id = ?", filter.ProjectNameID)
	}

	// 使用 Session 避免修改原始 query 对象
	if err := query.Session(&gorm.Session{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if total == 0 {
		return []*model.ApiProjectDO{}, 0, nil
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
