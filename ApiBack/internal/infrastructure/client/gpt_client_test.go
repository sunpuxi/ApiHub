package client

import (
	"ApiBack/internal/domian/entity"
	"context"
	"testing"

	"github.com/meguminnnnnnnnn/go-openai"
)

func TestGPTClient_GenerateMockData_Integration(t *testing.T) {
	// 使用你提供的 Key 进行集成测试
	apiKey := "sk-3bd260630fc94c318d676e1e32786857"

	config := openai.DefaultConfig(apiKey)
	config.BaseURL = "https://api.deepseek.com"
	client := openai.NewClientWithConfig(config)
	c := NewGPTClient(client)

	m := &entity.GPTRequest{
		Role:   "你是一个翻译官。",
		Prompt: "请将用户输入的内容翻译成英文。",
		Input:  "你好，世界",
	}

	ctx := context.Background()
	resp, err := c.Generate(ctx, m)

	if err != nil {
		t.Fatalf("调用失败: %v", err)
	}

	if resp.Content == "" {
		t.Error("返回内容为空")
	}

	t.Logf("DeepSeek 响应内容: %s", resp.Content)
}
