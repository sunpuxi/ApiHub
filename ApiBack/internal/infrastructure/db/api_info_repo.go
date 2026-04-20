package db

import (
	"ApiBack/internal/domian/repository"
	"ApiBack/internal/infrastructure/model"
	"time"

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
	return r.CreateApiInfoTx(r.db, apiInfo)
}

func (r *ApiInfoRepo) CreateApiInfoTx(tx *gorm.DB, apiInfo *model.ApiInfoDO) error {
	if apiInfo.Id > 0 {
		return tx.Table(apiInfoTableName).Where("id = ?", apiInfo.Id).Updates(apiInfo).Error
	}
	return tx.Table(apiInfoTableName).Create(apiInfo).Error
}

func (r *ApiInfoRepo) GetApiInfoByID(id int64) (*model.ApiInfoDO, error) {
	var row model.ApiInfoDO
	err := r.db.Table(apiInfoTableName).Where("id = ? AND is_del = ?", id, 0).First(&row).Error
	if err != nil {
		return nil, err
	}
	return &row, nil
}

func (r *ApiInfoRepo) SetMockGenerationRunning(id int64) error {
	return r.db.Table(apiInfoTableName).Where("id = ? AND is_del = ?", id, 0).Updates(map[string]interface{}{
		"mock_generation_status":     model.MockGenStatusRunning,
		"mock_generation_updated_at": time.Now(),
	}).Error
}

func (r *ApiInfoRepo) SetMockGenerationOutcome(id int64, mockData *string, status string, errMsg *string) error {
	updates := map[string]interface{}{
		"mock_generation_status":     status,
		"mock_generation_updated_at": time.Now(),
	}
	if mockData != nil {
		updates["mock_data"] = *mockData
	}
	if errMsg != nil {
		updates["mock_generation_error"] = *errMsg
	} else {
		updates["mock_generation_error"] = nil
	}
	return r.db.Table(apiInfoTableName).Where("id = ? AND is_del = ?", id, 0).Updates(updates).Error
}

func (r *ApiInfoRepo) QueryApiInfos(filter *repository.ApiInfoFilter) ([]*model.ApiInfoDO, int64, error) {
	var apiInfos []*model.ApiInfoDO
	var total int64

	// 使用 Table 获取一个基础查询对象
	query := r.db.Table(apiInfoTableName).Where("is_del = ?", 0)

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
	if filter.InterfaceName != "" {
		query = query.Where("title LIKE ?", "%"+filter.InterfaceName+"%")
	}

	// 1. 先统计总数，使用 Session 避免修改原始 query 对象
	if err := query.Session(&gorm.Session{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 如果总数为 0，直接返回
	if total == 0 {
		return []*model.ApiInfoDO{}, 0, nil
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

	// 2. 查询数据
	if err := query.Offset(offset).Limit(pageSize).Find(&apiInfos).Error; err != nil {
		return nil, 0, err
	}

	return apiInfos, total, nil
}
