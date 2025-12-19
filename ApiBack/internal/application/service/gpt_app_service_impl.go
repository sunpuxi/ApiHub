package service

import (
	"ApiBack/internal/application/interfaces"
	"ApiBack/internal/domian/entity"
	"ApiBack/internal/domian/service"
	"context"
)

type gptAppServiceImpl struct {
	gptService *service.GPTService
}

func NewGPTAppService(gptService *service.GPTService) interfaces.GPTAppService {
	return &gptAppServiceImpl{gptService: gptService}
}

func (s *gptAppServiceImpl) ExecutePrompt(ctx context.Context, role, prompt, input string) (*entity.GPTResponse, error) {
	req := &entity.GPTRequest{
		Role:   role,
		Prompt: prompt,
		Input:  input,
	}

	return s.gptService.Generate(ctx, req)
}
