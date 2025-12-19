package init

import (
	"ApiBack/common/config"
	appServ "ApiBack/internal/application/service"
	"ApiBack/internal/domian/service"
	"ApiBack/internal/infrastructure/client"
	repoImpl "ApiBack/internal/infrastructure/db"
	"ApiBack/internal/interface/api"

	"github.com/meguminnnnnnnnn/go-openai"
	"gorm.io/gorm"
)

type Container struct {
	DB                   *gorm.DB
	ApiProjectController *api.ApiProjectController
	ApiInfoController    *api.ApiInfoController
}

func NewContainer(db *gorm.DB, cfg *config.Config) *Container {
	// 项目相关依赖
	apiProjectRepoImpl := repoImpl.NewApiProjectRepo(db)
	apiProjectService := service.NewApiProjectService(apiProjectRepoImpl)
	apProject := appServ.NewApiProjectAppServiceImpl(apiProjectService)
	apiProjectController := api.NewApiProjectController(apProject)

	// 接口相关依赖
	apiInfoRepoImpl := repoImpl.NewApiInfoRepo(db)
	apiInfoService := service.NewApiInfoService(apiInfoRepoImpl)

	// GPT 相关依赖
	openAIConfig := openai.DefaultConfig(cfg.DeepSeekKey)
	openAIConfig.BaseURL = "https://api.deepseek.com"
	openAIClient := openai.NewClientWithConfig(openAIConfig)
	gptRepo := client.NewGPTClient(openAIClient)
	gptService := service.NewGPTService(gptRepo)

	apiInfoAppService := appServ.NewApiInfoAppServiceImpl(apiInfoService, gptService)
	apiInfoController := api.NewApiInfoController(apiInfoAppService)

	return &Container{
		DB:                   db,
		ApiProjectController: apiProjectController,
		ApiInfoController:    apiInfoController,
	}
}
