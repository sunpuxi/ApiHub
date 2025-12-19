package repository

import (
	"ApiBack/internal/domian/entity"
	"context"
)

type GPTRepository interface {

	// 生成
	Generate(ctx context.Context, req *entity.GPTRequest) (*entity.GPTResponse, error)
}
