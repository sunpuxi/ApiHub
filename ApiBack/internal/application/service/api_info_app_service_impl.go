package service

import (
	"ApiBack/internal/application/command"
	"ApiBack/internal/application/interfaces"
	"ApiBack/internal/application/mapper"
	"ApiBack/internal/application/query"
	"ApiBack/internal/domian/entity"
	domainService "ApiBack/internal/domian/service"
	"context"
	"fmt"
	"log"
)

type ApiInfoAppServiceImpl struct {
	apiInfoService *domainService.ApiInfoService
	gptService     *domainService.GPTService
}

func NewApiInfoAppServiceImpl(apiInfoService *domainService.ApiInfoService, gptService *domainService.GPTService) interfaces.ApiInfoAppService {
	return &ApiInfoAppServiceImpl{
		apiInfoService: apiInfoService,
		gptService:     gptService,
	}
}

func (s *ApiInfoAppServiceImpl) CreateApiInfo(cmd *command.CreateApiInfoCmd) (int64, error) {
	apiInfo := mapper.ToApiInfoEntity(cmd)

	// 如果是新增接口，且没有填写 mock_data，但有 resp_schema，则自动生成 mock 数据
	if ((cmd.ID == 0 && apiInfo.MockData == "") || (cmd.IsUpdateRespSchema)) && apiInfo.RespSchema != "" {
		ctx := context.Background()
		req := &entity.GPTRequest{
			Role:   "你是一个专业的后端开发工程师和 JSON 专家。",
			Prompt: "请根据我提供的 JSON Schema，生成一份符合该结构的 JSON Mock 数据。要求：1. 只返回 JSON 内容本身，不要有任何 Markdown 代码块标签或其他解释文字。2. 字段值要尽量真实且多样化。",
			Input:  fmt.Sprintf("JSON Schema 内容如下：\n%s", apiInfo.RespSchema),
		}

		resp, err := s.gptService.Generate(ctx, req)
		if err != nil {
			log.Printf("自动生成 Mock 数据失败: %v", err)
			// 生成失败不影响接口创建流程，仅记录日志
		} else if resp != nil {
			apiInfo.MockData = resp.Content
		}
	}

	validateApiInfo, err := entity.NewValidateApiInfo(apiInfo)
	if err != nil {
		log.Println("接口验证失败", err)
		return 0, fmt.Errorf("接口验证失败: %v", err)
	}
	err = s.apiInfoService.CreateApiInfo(validateApiInfo.ApiInfo)
	if err != nil {
		log.Println("接口创建失败", err)
		return 0, fmt.Errorf("接口创建失败: %v", err)
	}

	return validateApiInfo.ApiInfo.Id, nil
}

func (s *ApiInfoAppServiceImpl) QueryApiInfos(q *query.ApiInfoQuery) ([]*query.ApiInfoQueryResult, int64, error) {
	filter := mapper.ToApiInfoFilter(q)
	apiInfos, total, err := s.apiInfoService.QueryApiInfos(filter)
	if err != nil {
		log.Println("接口查询失败", err)
		return nil, 0, fmt.Errorf("接口查询失败: %v", err)
	}
	results := mapper.ToApiInfoQueryResultList(apiInfos)
	return results, total, nil
}
