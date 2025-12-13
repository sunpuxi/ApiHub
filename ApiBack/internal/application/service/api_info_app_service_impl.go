package service

import (
	"ApiBack/internal/application/command"
	"ApiBack/internal/application/mapper"
	"ApiBack/internal/application/query"
	"ApiBack/internal/domian/entity"
	domainService "ApiBack/internal/domian/service"
	"fmt"
	"log"
)

type ApiInfoAppServiceImpl struct {
	apiInfoService *domainService.ApiInfoService
}

func NewApiInfoAppServiceImpl(apiInfoService *domainService.ApiInfoService) *ApiInfoAppServiceImpl {
	return &ApiInfoAppServiceImpl{apiInfoService: apiInfoService}
}

func (s *ApiInfoAppServiceImpl) CreateApiInfo(cmd *command.CreateApiInfoCmd) error {
	apiInfo := mapper.ToApiInfoEntity(cmd)
	validateApiInfo, err := entity.NewValidateApiInfo(apiInfo)
	if err != nil {
		log.Println("接口验证失败", err)
		return fmt.Errorf("接口验证失败: %v", err)
	}
	err = s.apiInfoService.CreateApiInfo(validateApiInfo.ApiInfo)
	if err != nil {
		log.Println("接口创建失败", err)
		return fmt.Errorf("接口创建失败: %v", err)
	}
	return nil
}

func (s *ApiInfoAppServiceImpl) QueryApiInfos(q *query.ApiInfoQuery) ([]*query.ApiInfoQueryResult, int64, error) {
	filter := mapper.ToApiInfoFilter(q)
	apiInfos, total, err := s.apiInfoService.QueryApiInfos(filter)
	if err != nil {
		log.Println("接口查询失败", err)
		return nil, 0, fmt.Errorf("接口查询失败: %v", err)
	}
	results := mapper.ToApiInfoQueryResultList(apiInfos)
	return results, total, nil
}