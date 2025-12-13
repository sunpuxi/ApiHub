package command

type CreateApiProjectCmd struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Editor      string `json:"editor"`
	Creator     string `json:"creator"`
}
