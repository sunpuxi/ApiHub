/** 后端未返回新字段时视为 skipped */
export function normalizeMockGenerationStatus(status?: string): string {
  if (!status || status.trim() === '') {
    return 'skipped';
  }
  return status;
}

export function mockGenerationStatusLabel(status?: string): string {
  const s = normalizeMockGenerationStatus(status);
  const map: Record<string, string> = {
    pending: '等待生成',
    running: '生成中',
    success: '已生成',
    failed: '生成失败',
    skipped: '未异步生成',
  };
  return map[s] ?? s;
}

/** Ant Design Tag color */
export function mockGenerationStatusTagColor(status?: string): string {
  const s = normalizeMockGenerationStatus(status);
  const map: Record<string, string> = {
    pending: 'processing',
    running: 'processing',
    success: 'success',
    failed: 'error',
    skipped: 'default',
  };
  return map[s] ?? 'default';
}
