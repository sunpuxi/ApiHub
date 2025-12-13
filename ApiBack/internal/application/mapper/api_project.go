package mapper

import (
	"ApiBack/internal/application/command"
	"ApiBack/internal/application/query"
	"ApiBack/internal/domian/entity"
	"ApiBack/internal/domian/repository"
)

func ToApiProjectEntity(cmd *command.CreateApiProjectCmd) *entity.ApiProject {
	return &entity.ApiProject{
		Name:        cmd.Name,
		Description: cmd.Description,
		Editor:      cmd.Editor,
		Creator:     cmd.Creator,
	}
}

func ToApiProjectFilter(q *query.ApiProjectQuery) *repository.ApiProjectFilter {
	return &repository.ApiProjectFilter{
		Id:            q.Id,
		ProjectNameID: q.ProjectNameID,
		Page:          q.Page,
		PageSize:      q.PageSize,
	}
}

func ToApiProjectQueryResult(project *entity.ApiProject) *query.ApiProjectQueryResult {
	return &query.ApiProjectQueryResult{
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

func ToApiProjectQueryResultList(projects []*entity.ApiProject) []*query.ApiProjectQueryResult {
	results := make([]*query.ApiProjectQueryResult, 0, len(projects))
	for _, project := range projects {
		results = append(results, ToApiProjectQueryResult(project))
	}
	return results
}
