package init

import (
	"github.com/gin-gonic/gin"
)

func RegisterRoutes(router *gin.Engine, container *Container) {
	api := router.Group("/api")
	{
		v1 := api.Group("/v1")
		{
			projects := v1.Group("/projects")
			{
				projects.POST("createProject", container.ApiProjectController.CreateApiProject)
			}
			apis := v1.Group("/apis")
			{
				apis.POST("createApi", container.ApiInfoController.CreateApiInfo)
			}
		}
	}
}
