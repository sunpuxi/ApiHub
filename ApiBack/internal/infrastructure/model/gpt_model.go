package model

type GPTModel struct {
	Role   string `json:"role"`
	Prompt string `json:"prompt"`
	Input  string `json:"input"`
}
