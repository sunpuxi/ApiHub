package mapper

import (
	"ApiBack/internal/domian/entity"
	"ApiBack/internal/infrastruction/model"
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
