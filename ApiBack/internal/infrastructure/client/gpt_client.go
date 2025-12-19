package client

import (
	"ApiBack/internal/domian/entity"
	"ApiBack/internal/domian/repository"
	"context"

	"github.com/meguminnnnnnnnn/go-openai"
)

type GPTClient struct {
	client *openai.Client
}

func NewGPTClient(client *openai.Client) repository.GPTRepository {
	return &GPTClient{client: client}
}

func (c *GPTClient) Generate(ctx context.Context, req *entity.GPTRequest) (*entity.GPTResponse, error) {
	var temperature float32 = 0.7

	// 构建请求内容
	resp, err := c.client.CreateChatCompletion(
		ctx,
		openai.ChatCompletionRequest{
			Model: "deepseek-chat", // 或者使用 deepseek-reasoner (R1 模型)
			Messages: []openai.ChatCompletionMessage{
				{
					Role:    openai.ChatMessageRoleSystem,
					Content: req.Role + req.Prompt,
				},
				{
					Role:    openai.ChatMessageRoleUser,
					Content: req.Input,
				},
			},
			MaxTokens:   1024,
			Temperature: &temperature,
		},
	)

	if err != nil {
		return nil, err
	}

	return &entity.GPTResponse{Content: resp.Choices[0].Message.Content}, nil
}
