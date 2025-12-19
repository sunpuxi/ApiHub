package mapper

import (
	"ApiBack/internal/application/command"
	"ApiBack/internal/application/query"
	"ApiBack/internal/domian/entity"
	"ApiBack/internal/domian/repository"
)

func ToApiInfoEntity(cmd *command.CreateApiInfoCmd) *entity.ApiInfo {
	return &entity.ApiInfo{
		Id:          cmd.ID,
		ProjectID:   cmd.ProjectID,
		Path:        cmd.Path,
		Method:      cmd.Method,
		Title:       cmd.Title,
		ReqSchema:   cmd.ReqSchema,
		RespSchema:  cmd.RespSchema,
		Version:     cmd.Version,
		Description: cmd.Description,
		Editor:      cmd.Editor,
		Creator:     cmd.Creator,
		MockData:    cmd.MockData,
	}
}

func ToApiInfoFilter(q *query.ApiInfoQuery) *repository.ApiInfoFilter {
	return &repository.ApiInfoFilter{
		Id:            q.Id,
		ProjectID:     q.ProjectID,
		Path:          q.Path,
		Method:        q.Method,
		InterfaceName: q.InterfaceName,
		Page:          q.Page,
		PageSize:      q.PageSize,
	}
}

func ToApiInfoQueryResult(apiInfo *entity.ApiInfo) *query.ApiInfoQueryResult {
	return &query.ApiInfoQueryResult{
		Id:          apiInfo.Id,
		ProjectID:   apiInfo.ProjectID,
		Path:        apiInfo.Path,
		Method:      apiInfo.Method,
		ApiNameID:   apiInfo.ApiNameID,
		Title:       apiInfo.Title,
		ReqSchema:   apiInfo.ReqSchema,
		RespSchema:  apiInfo.RespSchema,
		Version:     apiInfo.Version,
		Description: apiInfo.Description,
		CTime:       apiInfo.CTime,
		MTime:       apiInfo.MTime,
		IsDel:       apiInfo.IsDel,
		Editor:      apiInfo.Editor,
		Creator:     apiInfo.Creator,
		MockData:    apiInfo.MockData,
	}
}

func ToApiInfoQueryResultList(apiInfos []*entity.ApiInfo) []*query.ApiInfoQueryResult {
	results := make([]*query.ApiInfoQueryResult, 0, len(apiInfos))
	for _, apiInfo := range apiInfos {
		results = append(results, ToApiInfoQueryResult(apiInfo))
	}
	return results
}
