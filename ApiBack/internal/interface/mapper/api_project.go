package mapper

import (
	"ApiBack/internal/application/query"
	"ApiBack/internal/interface/dto"
	"ApiBack/internal/interface/resopnse"
)

func ToApiProjectQuery(req *dto.ApiProjectQueryReq) *query.ApiProjectQuery {
	page := req.Page
	if page < 1 {
		page = 1
	}
	pageSize := req.PageSize
	if pageSize < 1 {
		pageSize = 10
	}
	return &query.ApiProjectQuery{
		Id:            req.Id,
		ProjectNameID: req.ProjectNameID,
		Page:          page,
		PageSize:      pageSize,
	}
}

func ToApiProjectResponse(results []*query.ApiProjectQueryResult, total int64) *resopnse.ApiProjectResponse {
	items := make([]resopnse.ApiProjectItem, 0, len(results))
	for _, result := range results {
		items = append(items, resopnse.ApiProjectItem{
			ProjectID:   result.ProjectID,
			Name:        result.Name,
			Description: result.Description,
			CTime:       result.CTime,
			MTime:       result.MTime,
			IsDel:       result.IsDel,
			Editor:      result.Editor,
			Creator:     result.Creator,
		})
	}
	return &resopnse.ApiProjectResponse{
		Items: items,
		Total: total,
	}
}
