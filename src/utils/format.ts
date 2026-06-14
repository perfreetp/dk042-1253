import {
  QualityLevel,
  RuleType,
  RuleStatus,
  TaskStatus,
  TicketStatus,
  Priority,
} from '../data/types';

/**
 * 质量分颜色映射 - 根据分数返回对应的颜色值
 */
export const getScoreColor = (score: number): string => {
  if (score >= 90) return '#10b981';
  if (score >= 80) return '#3b82f6';
  if (score >= 70) return '#f59e0b';
  return '#ef4444';
};

/**
 * 质量等级颜色映射
 */
export const getLevelColor = (level: QualityLevel): string => {
  const colorMap: Record<QualityLevel, string> = {
    [QualityLevel.Excellent]: '#10b981',
    [QualityLevel.Good]: '#3b82f6',
    [QualityLevel.Pass]: '#f59e0b',
    [QualityLevel.Fail]: '#ef4444',
  };
  return colorMap[level];
};

/**
 * 质量等级背景色映射 (浅色背景)
 */
export const getLevelBgColor = (level: QualityLevel): string => {
  const colorMap: Record<QualityLevel, string> = {
    [QualityLevel.Excellent]: 'rgba(16, 185, 129, 0.1)',
    [QualityLevel.Good]: 'rgba(59, 130, 246, 0.1)',
    [QualityLevel.Pass]: 'rgba(245, 158, 11, 0.1)',
    [QualityLevel.Fail]: 'rgba(239, 68, 68, 0.1)',
  };
  return colorMap[level];
};

/**
 * 质量等级文本映射
 */
export const getLevelText = (level: QualityLevel): string => {
  const textMap: Record<QualityLevel, string> = {
    [QualityLevel.Excellent]: '优秀',
    [QualityLevel.Good]: '良好',
    [QualityLevel.Pass]: '合格',
    [QualityLevel.Fail]: '不合格',
  };
  return textMap[level];
};

/**
 * 规则类型文本映射
 */
export const getRuleTypeText = (type: RuleType): string => {
  const textMap: Record<RuleType, string> = {
    [RuleType.Completeness]: '完整性',
    [RuleType.Accuracy]: '准确性',
    [RuleType.Consistency]: '一致性',
    [RuleType.Timeliness]: '及时性',
    [RuleType.Uniqueness]: '唯一性',
  };
  return textMap[type];
};

/**
 * 规则类型颜色映射
 */
export const getRuleTypeColor = (type: RuleType): string => {
  const colorMap: Record<RuleType, string> = {
    [RuleType.Completeness]: '#8b5cf6',
    [RuleType.Accuracy]: '#06b6d4',
    [RuleType.Consistency]: '#f59e0b',
    [RuleType.Timeliness]: '#ec4899',
    [RuleType.Uniqueness]: '#10b981',
  };
  return colorMap[type];
};

/**
 * 规则状态文本映射
 */
export const getRuleStatusText = (status: RuleStatus): string => {
  const textMap: Record<RuleStatus, string> = {
    [RuleStatus.Enabled]: '已启用',
    [RuleStatus.Disabled]: '已禁用',
    [RuleStatus.Pending]: '待审核',
  };
  return textMap[status];
};

/**
 * 规则状态颜色映射
 */
export const getRuleStatusColor = (status: RuleStatus): string => {
  const colorMap: Record<RuleStatus, string> = {
    [RuleStatus.Enabled]: '#10b981',
    [RuleStatus.Disabled]: '#9ca3af',
    [RuleStatus.Pending]: '#f59e0b',
  };
  return colorMap[status];
};

/**
 * 任务状态文本映射
 */
export const getTaskStatusText = (status: TaskStatus): string => {
  const textMap: Record<TaskStatus, string> = {
    [TaskStatus.Pending]: '待执行',
    [TaskStatus.Running]: '执行中',
    [TaskStatus.Success]: '成功',
    [TaskStatus.Failed]: '失败',
  };
  return textMap[status];
};

/**
 * 任务状态颜色映射
 */
export const getTaskStatusColor = (status: TaskStatus): string => {
  const colorMap: Record<TaskStatus, string> = {
    [TaskStatus.Pending]: '#9ca3af',
    [TaskStatus.Running]: '#3b82f6',
    [TaskStatus.Success]: '#10b981',
    [TaskStatus.Failed]: '#ef4444',
  };
  return colorMap[status];
};

/**
 * 工单状态文本映射
 */
export const getTicketStatusText = (status: TicketStatus): string => {
  const textMap: Record<TicketStatus, string> = {
    [TicketStatus.Open]: '待处理',
    [TicketStatus.InProgress]: '处理中',
    [TicketStatus.PendingReview]: '待验证',
    [TicketStatus.Resolved]: '已解决',
    [TicketStatus.Closed]: '已关闭',
  };
  return textMap[status];
};

/**
 * 工单状态颜色映射
 */
export const getTicketStatusColor = (status: TicketStatus): string => {
  const colorMap: Record<TicketStatus, string> = {
    [TicketStatus.Open]: '#ef4444',
    [TicketStatus.InProgress]: '#3b82f6',
    [TicketStatus.PendingReview]: '#f59e0b',
    [TicketStatus.Resolved]: '#10b981',
    [TicketStatus.Closed]: '#6b7280',
  };
  return colorMap[status];
};

/**
 * 优先级文本映射
 */
export const getPriorityText = (priority: Priority): string => {
  const textMap: Record<Priority, string> = {
    [Priority.Critical]: '紧急',
    [Priority.High]: '高',
    [Priority.Medium]: '中',
    [Priority.Low]: '低',
  };
  return textMap[priority];
};

/**
 * 优先级颜色映射
 */
export const getPriorityColor = (priority: Priority): string => {
  const colorMap: Record<Priority, string> = {
    [Priority.Critical]: '#dc2626',
    [Priority.High]: '#f97316',
    [Priority.Medium]: '#eab308',
    [Priority.Low]: '#6b7280',
  };
  return colorMap[priority];
};

/**
 * 优先级背景色映射
 */
export const getPriorityBgColor = (priority: Priority): string => {
  const colorMap: Record<Priority, string> = {
    [Priority.Critical]: 'rgba(220, 38, 38, 0.1)',
    [Priority.High]: 'rgba(249, 115, 22, 0.1)',
    [Priority.Medium]: 'rgba(234, 179, 8, 0.1)',
    [Priority.Low]: 'rgba(107, 114, 128, 0.1)',
  };
  return colorMap[priority];
};

/**
 * 日期格式化 - YYYY-MM-DD HH:mm:ss
 */
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  const pad = (n: number) => n.toString().padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * 日期格式化 - YYYY-MM-DD
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const pad = (n: number) => n.toString().padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());

  return `${year}-${month}-${day}`;
};

/**
 * 相对时间格式化
 */
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return `${diffSeconds}秒前`;
  if (diffMinutes < 60) return `${diffMinutes}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 30) return `${diffDays}天前`;

  return formatDate(dateString);
};

/**
 * 数字格式化 - 千分位分隔
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString('zh-CN');
};

/**
 * 数字格式化 - 压缩显示 (如 1.2k, 3.5M)
 */
export const formatCompactNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
};

/**
 * 百分比格式化
 */
export const formatPercent = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};
