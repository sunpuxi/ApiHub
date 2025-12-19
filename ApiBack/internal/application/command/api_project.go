package command

type CreateApiProjectCmd struct {
	ID          int64  `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Editor      string `json:"editor"`
	Creator     string `json:"creator"`
}
