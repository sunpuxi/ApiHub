package service

import (
	"ApiBack/internal/domian/entity"
	"ApiBack/internal/domian/repository"
	"context"
)

type GPTService struct {
	gptRepository repository.GPTRepository
}

func NewGPTService(gptRepository repository.GPTRepository) *GPTService {
	return &GPTService{gptRepository: gptRepository}
}

func (s *GPTService) Generate(ctx context.Context, req *entity.GPTRequest) (*entity.GPTResponse, error) {
	return s.gptRepository.Generate(ctx, req)
}
