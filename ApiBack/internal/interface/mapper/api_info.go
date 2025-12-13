package mapper

import (
	"ApiBack/internal/application/query"
	"ApiBack/internal/interface/dto"
	"ApiBack/internal/interface/resopnse"
)

func ToApiInfoQuery(req *dto.ApiInfoQueryReq) *query.ApiInfoQuery {
	page := req.Page
	if page < 1 {
		page = 1
	}
	pageSize := req.PageSize
	if pageSize < 1 {
		pageSize = 10
	}
	return &query.ApiInfoQuery{
		Id:        req.Id,
		ProjectID: req.ProjectID,
		Path:      req.Path,
		Method:    req.Method,
		Page:      page,
		PageSize:  pageSize,
	}
}

func ToApiInfoResponse(results []*query.ApiInfoQueryResult, total int64) *resopnse.ApiInfoResponse {
	items := make([]resopnse.ApiInfoItem, 0, len(results))
	for _, result := range results {
		items = append(items, resopnse.ApiInfoItem{
			Id:          result.Id,
			ProjectID:   result.ProjectID,
			Path:        result.Path,
			Method:      result.Method,
			ApiNameID:   result.ApiNameID,
			Title:       result.Title,
			ReqSchema:   result.ReqSchema,
			RespSchema:  result.RespSchema,
			Version:     result.Version,
			Description: result.Description,
			CTime:       result.CTime,
			MTime:       result.MTime,
			IsDel:       result.IsDel,
			Editor:      result.Editor,
			Creator:     result.Creator,
		})
	}
	return &resopnse.ApiInfoResponse{
		Items: items,
		Total: total,
	}
}

