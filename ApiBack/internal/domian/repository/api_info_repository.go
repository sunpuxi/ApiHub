package repository

import "ApiBack/internal/infrastruction/model"

type ApiInfoRepository interface {
	// 创建接口
	CreateApiInfo(apiInfo *model.ApiInfoDO) error
}
