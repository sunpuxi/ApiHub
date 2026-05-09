package init

import (
	"ApiBack/common/config"
	appServ "ApiBack/internal/application/service"
	"ApiBack/internal/domian/service"
	"ApiBack/internal/infrastructure/client"
	repoImpl "ApiBack/internal/infrastructure/db"
	"ApiBack/internal/infrastructure/worker"
	"ApiBack/internal/interface/api"

	"github.com/meguminnnnnnnnn/go-openai"
	"gorm.io/gorm"
)

type Container struct {
	DB                   *gorm.DB
	ApiProjectController *api.ApiProjectController
	ApiInfoController    *api.ApiInfoController
	MCPController        *api.MCPController
	AsyncWorker          *worker.AsyncTaskWorker
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

	asyncTaskRepo := repoImpl.NewAsyncTaskRepo(db, apiInfoRepoImpl)
	apiInfoAppService := appServ.NewApiInfoAppServiceImpl(apiInfoService, asyncTaskRepo, db, cfg.AsyncWorker)
	apiInfoController := api.NewApiInfoController(apiInfoAppService)

	asyncWorker := worker.NewAsyncTaskWorker(asyncTaskRepo, apiInfoRepoImpl, gptService, cfg.AsyncWorker)

	// MCP 相关依赖
	mcpServer := appServ.NewMCPServer(apiInfoAppService, apiProjectService)
	mcpController := api.NewMCPController(mcpServer)

	return &Container{
		DB:                   db,
		ApiProjectController: apiProjectController,
		ApiInfoController:    apiInfoController,
		MCPController:        mcpController,
		AsyncWorker:          asyncWorker,
	}
}
