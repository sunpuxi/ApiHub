package model

import (
	"time"
)

const AsyncTaskTableName = "async_task"

const (
	TaskTypeGenerateAPIMock = "GENERATE_API_MOCK"

	TaskStatusPending   = "pending"
	TaskStatusRunning   = "running"
	TaskStatusSuccess   = "success"
	TaskStatusFailed    = "failed"
	TaskStatusCancelled = "cancelled"
)

const (
	MockGenStatusPending = "pending"
	MockGenStatusRunning = "running"
	MockGenStatusSuccess = "success"
	MockGenStatusFailed  = "failed"
	MockGenStatusSkipped = "skipped"
)

type AsyncTaskDO struct {
	Id             int64      `gorm:"column:id;primaryKey;autoIncrement" json:"id"`
	TaskType       string     `gorm:"column:task_type;type:varchar(64);not null" json:"task_type"`
	Payload        string     `gorm:"column:payload;type:json;not null" json:"payload"`
	Status         string     `gorm:"column:status;type:varchar(32);not null" json:"status"`
	IdempotencyKey string     `gorm:"column:idempotency_key;type:varchar(128);not null;index" json:"idempotency_key"`
	Attempts       int        `gorm:"column:attempts;not null;default:0" json:"attempts"`
	MaxAttempts    int        `gorm:"column:max_attempts;not null;default:5" json:"max_attempts"`
	NextRetryAt    *time.Time `gorm:"column:next_retry_at" json:"next_retry_at"`
	LeaseOwner     *string    `gorm:"column:lease_owner;type:varchar(64)" json:"lease_owner"`
	LeaseExpireAt  *time.Time `gorm:"column:lease_expire_at" json:"lease_expire_at"`
	LastError      *string    `gorm:"column:last_error;type:varchar(512)" json:"last_error"`
	StartedAt      *time.Time `gorm:"column:started_at" json:"started_at"`
	FinishedAt     *time.Time `gorm:"column:finished_at" json:"finished_at"`
	CreatedAt      time.Time  `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	UpdatedAt      time.Time  `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
}

func (AsyncTaskDO) TableName() string {
	return AsyncTaskTableName
}
