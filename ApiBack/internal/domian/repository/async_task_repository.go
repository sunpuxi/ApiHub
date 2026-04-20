package repository

import (
	"ApiBack/internal/infrastructure/model"
	"time"

	"gorm.io/gorm"
)

type AsyncTaskRepository interface {
	// CreatePendingIfAbsent 在不存在同幂等键的 pending/running 任务时插入；在事务内调用。
	CreatePendingIfAbsent(tx *gorm.DB, row *model.AsyncTaskDO) (created bool, err error)

	// RecoverExpiredLeases 将租约已过期的 running 任务回收为 pending，或超过重试则 failed。
	RecoverExpiredLeases(now time.Time) error

	// ClaimNext 认领一条待处理任务（需在事务内 FOR UPDATE，方法内自管事务）。
	ClaimNext(owner string, lease time.Duration) (*model.AsyncTaskDO, error)

	// MarkSuccess 标记任务成功
	MarkSuccess(id int64) error

	// MarkFailedFinal 标记任务失败
	MarkFailedFinal(id int64, lastError string) error

	// ScheduleRetry 计划重试
	ScheduleRetry(id int64, lastError string, nextRetryAt time.Time) error
}
