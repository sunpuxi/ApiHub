package entity

type GPTRequest struct {
	Role   string
	Prompt string
	Input  string
}

type GPTResponse struct {
	Content string
}
