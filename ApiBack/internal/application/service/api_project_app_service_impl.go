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

func (s *ApiProjectAppServiceImpl) QueryApiProjects(q *query.ApiProjectQuery) ([]*query.ApiProjectQueryResult, int64, error) {
	filter := mapper.ToApiProjectFilter(q)
	projects, total, err := s.apiProjectService.QueryApiProjects(filter)
	if err != nil {
		log.Println("项目查询失败", err)
		return nil, 0, fmt.Errorf("项目查询失败: %v", err)
	}
	results := mapper.ToApiProjectQueryResultList(projects)
	return results, total, nil
}
