package api

import (
	"ApiBack/internal/application/interfaces"
	"ApiBack/internal/interface/dto"
	"ApiBack/internal/interface/dto/mapper"
	"net/http"

	"github.com/gin-gonic/gin"
)

type ApiProjectController struct {
	apiProjectAppService interfaces.ApiProjectAppService
}

func NewApiProjectController(apiProjectAppService interfaces.ApiProjectAppService) *ApiProjectController {
	return &ApiProjectController{apiProjectAppService: apiProjectAppService}
}

func (c *ApiProjectController) CreateApiProject(ctx *gin.Context) {
	var reqDto dto.CreateApiProjectRespDto
	if err := ctx.ShouldBindJSON(&reqDto); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	cmd := reqDto.ToCreateApiProjectCmd()
	if err := c.apiProjectAppService.CreateApiProject(cmd); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "保存成功"})
}

func (c *ApiProjectController) QueryApiProjects(ctx *gin.Context) {
	var reqDto dto.ApiProjectQueryReq
	if err := ctx.ShouldBindQuery(&reqDto); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	query := mapper.ToApiProjectQuery(&reqDto)
	results, total, err := c.apiProjectAppService.QueryApiProjects(query)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	response := mapper.ToApiProjectResponse(results, total)
	ctx.JSON(http.StatusOK, response)
}
