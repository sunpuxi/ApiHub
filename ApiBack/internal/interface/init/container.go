package init

import (
	appServ "ApiBack/internal/application/service"
	"ApiBack/internal/domian/service"
	repoImpl "ApiBack/internal/infrastruction/db"
	"ApiBack/internal/interface/api"

	"gorm.io/gorm"
)

type Container struct {
	DB                   *gorm.DB
	ApiProjectController *api.ApiProjectController
	ApiInfoController    *api.ApiInfoController
}

func NewContainer(db *gorm.DB) *Container {
	// 项目相关依赖
	apiProjectRepoImpl := repoImpl.NewApiProjectRepo(db)
	apiProjectService := service.NewApiProjectService(apiProjectRepoImpl)
	apProject := appServ.NewApiProjectAppServiceImpl(apiProjectService)
	apiProjectController := api.NewApiProjectController(apProject)

	// 接口相关依赖
	apiInfoRepoImpl := repoImpl.NewApiInfoRepo(db)
	apiInfoService := service.NewApiInfoService(apiInfoRepoImpl)
	apiInfoAppService := appServ.NewApiInfoAppServiceImpl(apiInfoService)
	apiInfoController := api.NewApiInfoController(apiInfoAppService)

	return &Container{
		DB:                   db,
		ApiProjectController: apiProjectController,
		ApiInfoController:    apiInfoController,
	}
}
