package init

import (
	"github.com/gin-gonic/gin"
)

func RegisterRoutes(router *gin.Engine, container *Container) {
	// MCP 协议端点（SSE transport）
	//   GET  /mcp → 建立 SSE 长连接
	//   POST /mcp → 投递 JSON-RPC 消息
	router.Any("/mcp", container.MCPController.HandleMCP)

	// REST API
	api := router.Group("/api")
	{
		v1 := api.Group("/v1")
		{
			projects := v1.Group("/projects")
			{
				projects.POST("/createProject", container.ApiProjectController.CreateApiProject)
				projects.GET("/query", container.ApiProjectController.QueryApiProjects)
			}
			apis := v1.Group("/apis")
			{
				apis.POST("/createApi", container.ApiInfoController.CreateApiInfo)
				apis.GET("/query", container.ApiInfoController.QueryApiInfos)
			}
		}
	}
}
