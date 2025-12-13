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

func ToApiInfoEntity(do *model.ApiInfoDO) *entity.ApiInfo {
	return &entity.ApiInfo{
		Id:          do.Id,
		ProjectID:   do.ProjectID,
		Path:        do.Path,
		Method:      do.Method,
		ApiNameID:   do.ApiNameID,
		Title:       do.Title,
		ReqSchema:   do.ReqSchema,
		RespSchema:  do.RespSchema,
		Version:     do.Version,
		Description: do.Description,
		CTime:       do.CTime,
		MTime:       do.MTime,
		IsDel:       do.IsDel,
		Editor:      do.Editor,
		Creator:     do.Creator,
	}
}

func ToApiInfoEntityList(dos []*model.ApiInfoDO) []*entity.ApiInfo {
	entities := make([]*entity.ApiInfo, 0, len(dos))
	for _, do := range dos {
		entities = append(entities, ToApiInfoEntity(do))
	}
	return entities
}