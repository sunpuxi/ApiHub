package service

import (
	"ApiBack/internal/domian/entity"
	"ApiBack/internal/domian/mapper"
	"ApiBack/internal/domian/repository"
	"strconv"
	"time"
)

type ApiProjectService struct {
	apiProjectRepository repository.ApiProjectRepository
}

func NewApiProjectService(apiProjectRepository repository.ApiProjectRepository) *ApiProjectService {
	return &ApiProjectService{apiProjectRepository: apiProjectRepository}
}

func (s *ApiProjectService) CreateApiProject(project *entity.ApiProject) error {
	projectDO := mapper.ToApiProjectDO(project)
	projectDO.ProjectID = "1112323" + strconv.FormatInt(time.Now().Unix(), 10)
	return s.apiProjectRepository.CreateApiProject(projectDO)
}

func (s *ApiProjectService) QueryApiProjects(filter *repository.ApiProjectFilter) ([]*entity.ApiProject, int64, error) {
	projectDOs, total, err := s.apiProjectRepository.QueryApiProjects(filter)
	if err != nil {
		return nil, 0, err
	}
	projects := mapper.ToApiProjectEntityList(projectDOs)
	return projects, total, nil
}
