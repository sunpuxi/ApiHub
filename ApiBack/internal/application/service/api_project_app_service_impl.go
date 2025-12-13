package service

import (
	"ApiBack/internal/application/command"
	"ApiBack/internal/application/mapper"
	"ApiBack/internal/domian/entity"
	domainService "ApiBack/internal/domian/service"
	"fmt"
	"log"
)

type ApiProjectAppServiceImpl struct {
	apiProjectService *domainService.ApiProjectService
}

func NewApiProjectAppServiceImpl(apiProjectService *domainService.ApiProjectService) *ApiProjectAppServiceImpl {
	return &ApiProjectAppServiceImpl{apiProjectService: apiProjectService}
}

func (s *ApiProjectAppServiceImpl) CreateApiProject(cmd *command.CreateApiProjectCmd) error {
	project := mapper.ToApiProjectEntity(cmd)
	validateProject, err := entity.NewValidateApiProject(project)
	if err != nil {
		log.Println("项目验证失败", err)
		return fmt.Errorf("项目验证失败: %v", err)
	}
	err = s.apiProjectService.CreateApiProject(validateProject.ApiProject)
	if err != nil {
		log.Println("项目创建失败", err)
		return fmt.Errorf("项目创建失败: %v", err)
	}
	return nil
}
