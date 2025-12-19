package model

import "time"

type ApiInfoDO struct {
	Id          int64     `gorm:"column:id;type:bigint(20) auto_increment;primary_key;not null" json:"id"`
	ProjectID   int64     `gorm:"column:project_id;type:bigint(20);not null" json:"project_id"`
	Path        string    `gorm:"column:path;type:varchar(256);not null" json:"path"`
	Method      string    `gorm:"column:method;type:varchar(10);not null" json:"method"`
	ApiNameID   string    `gorm:"column:api_name_id;type:varchar(256);not null" json:"api_name_id"`
	Title       string    `gorm:"column:title;type:varchar(256);not null" json:"title"`
	ReqSchema   string    `gorm:"column:req_schema;type:json" json:"req_schema"`
	RespSchema  string    `gorm:"column:resp_schema;type:json" json:"resp_schema"`
	Version     string    `gorm:"column:version;type:varchar(256);not null" json:"version"`
	Description string    `gorm:"column:description;type:text" json:"description"`
	CTime       time.Time `gorm:"column:ctime;type:datetime;not null;default:current_timestamp" json:"ctime"`
	MTime       time.Time `gorm:"column:mtime;type:datetime;not null;default:current_timestamp on update current_timestamp" json:"mtime"`
	IsDel       bool      `gorm:"column:is_del;type:tinyint(1);not null;default:0" json:"is_del"`
	Editor      string    `gorm:"column:editor;type:varchar(256)" json:"editor"`
	Creator     string    `gorm:"column:creator;type:varchar(256)" json:"creator"`
	MockData    string    `gorm:"column:mock_data;type:text" json:"mock_data"`
}
