package mapper

import (
	"ApiBack/internal/domian/entity"
	"ApiBack/internal/infrastructure/model"
)

func ToApiProjectDO(project *entity.ApiProject) *model.ApiProjectDO {
	return &model.ApiProjectDO{
		Id:          project.Id,
		ProjectID:   project.ProjectID,
		Name:        project.Name,
		Description: project.Description,
		CTime:       project.CTime,
		MTime:       project.MTime,
		IsDel:       project.IsDel,
		Editor:      project.Editor,
		Creator:     project.Creator,
	}
}

func ToApiProjectEntity(do *model.ApiProjectDO) *entity.ApiProject {
	return &entity.ApiProject{
		Id:          do.Id,
		ProjectID:   do.ProjectID,
		Name:        do.Name,
		Description: do.Description,
		CTime:       do.CTime,
		MTime:       do.MTime,
		IsDel:       do.IsDel,
		Editor:      do.Editor,
		Creator:     do.Creator,
	}
}

func ToApiProjectEntityList(dos []*model.ApiProjectDO) []*entity.ApiProject {
	entities := make([]*entity.ApiProject, 0, len(dos))
	for _, do := range dos {
		entities = append(entities, ToApiProjectEntity(do))
	}
	return entities
}
