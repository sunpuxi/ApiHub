package api

import (
	"ApiBack/internal/application/interfaces"
	"ApiBack/internal/interface/dto"
	"ApiBack/internal/interface/mapper"
	"net/http"

	"github.com/gin-gonic/gin"
)

type ApiInfoController struct {
	apiInfoAppService interfaces.ApiInfoAppService
}

func NewApiInfoController(apiInfoAppService interfaces.ApiInfoAppService) *ApiInfoController {
	return &ApiInfoController{apiInfoAppService: apiInfoAppService}
}

func (c *ApiInfoController) CreateApiInfo(ctx *gin.Context) {
	var reqDto dto.CreateApiInfoDto
	if err := ctx.ShouldBindJSON(&reqDto); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	cmd := reqDto.ToCreateApiInfoCmd()
	if err := c.apiInfoAppService.CreateApiInfo(cmd); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "创建成功"})
}

func (c *ApiInfoController) QueryApiInfos(ctx *gin.Context) {
	var reqDto dto.ApiInfoQueryReq
	if err := ctx.ShouldBindQuery(&reqDto); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	query := mapper.ToApiInfoQuery(&reqDto)
	results, total, err := c.apiInfoAppService.QueryApiInfos(query)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	response := mapper.ToApiInfoResponse(results, total)
	ctx.JSON(http.StatusOK, response)
}
