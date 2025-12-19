package interfaces

import (
	"ApiBack/internal/domian/entity"
	"context"
)

type GPTAppService interface {

	// 执行
	ExecutePrompt(ctx context.Context, role, prompt, input string) (*entity.GPTResponse, error)
}
