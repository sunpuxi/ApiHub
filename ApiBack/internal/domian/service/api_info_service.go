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
	apiInfo.ApiNameID = "API" + strconv.FormatInt(time.Now().Unix(), 10)
	apiInfoDO := mapper.ToApiInfoDO(apiInfo)
	return s.apiInfoRepository.CreateApiInfo(apiInfoDO)
}
