package main

import (
	"log"

	"ApiBack/common/config"
	"ApiBack/internal/infrastruction/db"
	routerInit "ApiBack/internal/interface/init"

	"github.com/gin-gonic/gin"
)

func main() {
	// 加载配置
	cfg, err := config.LoadConfig("config/application.yml")
	if err != nil {
		log.Fatalf("加载配置失败: %v", err)
	}

	// 初始化数据库
	gormDB, err := db.InitDB(cfg)
	if err != nil {
		log.Fatalf("初始化数据库失败: %v", err)
	}

	// 创建依赖容器
	container := routerInit.NewContainer(gormDB)

	// 初始化路由
	router := gin.Default()
	router.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "ApiHub API Service",
		})
	})

	// 注册业务路由
	routerInit.RegisterRoutes(router, container)

	// 启动服务
	if err := router.Run(":8080"); err != nil {
		log.Fatalf("启动服务失败: %v", err)
	}
}
