package service

import (
	"ApiBack/internal/domian/entity"
	"ApiBack/internal/domian/mapper"
	"ApiBack/internal/domian/repository"
	"strconv"
	"time"
)

type ApiInfoService struct {
	apiInfoRepository repository.ApiInfoRepository
}

func NewApiInfoService(apiInfoRepository repository.ApiInfoRepository) *ApiInfoService {
	return &ApiInfoService{apiInfoRepository: apiInfoRepository}
}

func (s *ApiInfoService) CreateApiInfo(apiInfo *entity.ApiInfo) error {
	if apiInfo.Id <= 0 {
		apiInfo.ApiNameID = "API" + strconv.FormatInt(time.Now().Unix(), 10)
	}
	apiInfoDO := mapper.ToApiInfoDO(apiInfo)
	err := s.apiInfoRepository.CreateApiInfo(apiInfoDO)
	if err != nil {
		return err
	}
	apiInfo.Id = apiInfoDO.Id
	return nil
}

func (s *ApiInfoService) QueryApiInfos(filter *repository.ApiInfoFilter) ([]*entity.ApiInfo, int64, error) {
	apiInfoDOs, total, err := s.apiInfoRepository.QueryApiInfos(filter)
	if err != nil {
		return nil, 0, err
	}
	apiInfos := mapper.ToApiInfoEntityList(apiInfoDOs)
	return apiInfos, total, nil
}
