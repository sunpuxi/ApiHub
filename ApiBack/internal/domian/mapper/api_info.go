package mapper

import (
	"ApiBack/internal/domian/entity"
	"ApiBack/internal/infrastruction/model"
)

func ToApiInfoDO(apiInfo *entity.ApiInfo) *model.ApiInfoDO {
	return &model.ApiInfoDO{
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
	}
}
