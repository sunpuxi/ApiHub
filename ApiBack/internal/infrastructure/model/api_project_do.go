package model

import "time"

type ApiProjectDO struct {
	Id          int64     `gorm:"column:id;type:bigint(20) auto_increment;primary_key;not null" json:"id"`
	ProjectID   string    `gorm:"column:project_name_id;type:varchar(256);not null" json:"project_id"`
	Name        string    `gorm:"column:name;type:varchar(256);not null" json:"name"`
	Description string    `gorm:"column:description;type:text" json:"description"`
	CTime       time.Time `gorm:"column:ctime;type:datetime;not null;default:current_timestamp" json:"ctime"`
	MTime       time.Time `gorm:"column:mtime;type:datetime;not null;default:current_timestamp on update current_timestamp" json:"mtime"`
	IsDel       bool      `gorm:"column:is_del;type:tinyint(1);not null;default:0" json:"is_del"`
	Editor      string    `gorm:"column:editor;type:varchar(256)" json:"editor"`
	Creator     string    `gorm:"column:creator;type:varchar(256)" json:"creator"`
}
