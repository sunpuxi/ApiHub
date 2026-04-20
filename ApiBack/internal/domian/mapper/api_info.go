package mapper

import (
	"ApiBack/internal/domian/entity"
	"ApiBack/internal/infrastructure/model"
	"time"
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
		MockData:    apiInfo.MockData,

		MockGenerationStatus:    apiInfo.MockGenerationStatus,
		MockGenerationError:     strPtrOrNil(apiInfo.MockGenerationError),
		MockGenerationUpdatedAt: timePtrOrNil(apiInfo.MockGenerationUpdatedAt),
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
		MockData:    do.MockData,

		MockGenerationStatus:    do.MockGenerationStatus,
		MockGenerationError:     derefString(do.MockGenerationError),
		MockGenerationUpdatedAt: derefTime(do.MockGenerationUpdatedAt),
	}
}

func strPtrOrNil(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

func timePtrOrNil(t time.Time) *time.Time {
	if t.IsZero() {
		return nil
	}
	return &t
}

func derefString(p *string) string {
	if p == nil {
		return ""
	}
	return *p
}

func derefTime(p *time.Time) time.Time {
	if p == nil {
		return time.Time{}
	}
	return *p
}

func ToApiInfoEntityList(dos []*model.ApiInfoDO) []*entity.ApiInfo {
	entities := make([]*entity.ApiInfo, 0, len(dos))
	for _, do := range dos {
		entities = append(entities, ToApiInfoEntity(do))
	}
	return entities
}
