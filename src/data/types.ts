/**
 * 质量等级枚举
 */
export enum QualityLevel {
  /** 优秀 */
  Excellent = 'excellent',
  /** 良好 */
  Good = 'good',
  /** 合格 */
  Pass = 'pass',
  /** 不合格 */
  Fail = 'fail',
}

/**
 * 规则类型枚举
 */
export enum RuleType {
  /** 完整性规则 - 检查数据是否缺失 */
  Completeness = 'completeness',
  /** 准确性规则 - 检查数据是否正确 */
  Accuracy = 'accuracy',
  /** 一致性规则 - 检查数据是否一致 */
  Consistency = 'consistency',
  /** 及时性规则 - 检查数据是否及时 */
  Timeliness = 'timeliness',
  /** 唯一性规则 - 检查数据是否重复 */
  Uniqueness = 'uniqueness',
}

/**
 * 规则状态枚举
 */
export enum RuleStatus {
  /** 已启用 */
  Enabled = 'enabled',
  /** 已禁用 */
  Disabled = 'disabled',
  /** 待审核 */
  Pending = 'pending',
}

/**
 * 任务状态枚举
 */
export enum TaskStatus {
  /** 待执行 */
  Pending = 'pending',
  /** 执行中 */
  Running = 'running',
  /** 执行成功 */
  Success = 'success',
  /** 执行失败 */
  Failed = 'failed',
}

/**
 * 工单状态枚举
 */
export enum TicketStatus {
  /** 待处理 */
  Open = 'open',
  /** 处理中 */
  InProgress = 'in_progress',
  /** 待验证 */
  PendingReview = 'pending_review',
  /** 已解决 */
  Resolved = 'resolved',
  /** 已关闭 */
  Closed = 'closed',
}

/**
 * 优先级枚举
 */
export enum Priority {
  /** 紧急 */
  Critical = 'critical',
  /** 高 */
  High = 'high',
  /** 中 */
  Medium = 'medium',
  /** 低 */
  Low = 'low',
}

/**
 * 用户接口
 */
export interface User {
  /** 用户唯一标识 */
  id: string;
  /** 用户姓名 */
  name: string;
  /** 用户邮箱 */
  email: string;
  /** 所属部门 */
  department: string;
}

/**
 * 业务主题接口
 */
export interface BusinessTopic {
  /** 主题唯一标识 */
  id: string;
  /** 主题名称 */
  name: string;
  /** 主题描述 */
  description: string;
  /** 所属系统 */
  system: string;
  /** 所属部门 */
  department: string;
  /** 质量分数 (0-100) */
  score: number;
  /** 质量等级 */
  level: QualityLevel;
  /** 关联规则数量 */
  ruleCount: number;
  /** 问题数量 */
  issueCount: number;
  /** 负责人ID */
  ownerId: string;
  /** 创建时间 */
  createdAt: string;
}

/**
 * 质量规则接口
 */
export interface QualityRule {
  /** 规则唯一标识 */
  id: string;
  /** 规则名称 */
  name: string;
  /** 规则描述 */
  description: string;
  /** 规则类型 */
  type: RuleType;
  /** 所属业务主题ID */
  topicId: string;
  /** 阈值配置 */
  threshold: {
    /** 最小值（准确性、及时性范围校验用） */
    min?: number;
    /** 最大值（准确性、及时性范围校验用） */
    max?: number;
    /** 目标合格率阈值 */
    target?: number;
    /** 告警阈值（低于此值触发告警） */
    warning?: number;
  };
  /** 规则状态 */
  status: RuleStatus;
  /** 执行频率 (cron表达式或描述) */
  frequency: string;
  /** 最近执行时间 */
  lastRunAt?: string;
  /** 创建人ID */
  creatorId: string;
  /** 创建时间 */
  createdAt: string;
}

/**
 * 任务触发类型
 */
export type TaskTriggerType = 'manual' | 'scheduled';

/**
 * 检查任务接口
 */
export interface CheckTask {
  /** 任务唯一标识 */
  id: string;
  /** 任务名称 */
  name: string;
  /** 关联规则ID列表（支持多规则） */
  ruleIds: string[];
  /** 触发类型 */
  triggerType: TaskTriggerType;
  /** 任务状态 */
  status: TaskStatus;
  /** 执行进度 (0-100) */
  progress: number;
  /** 开始时间 */
  startedAt?: string;
  /** 结束时间 */
  finishedAt?: string;
  /** 检查数据量 */
  recordCount: number;
  /** 异常数量 */
  anomalyCount: number;
  /** 执行人ID */
  executorId: string;
}

/**
 * 异常记录接口
 */
export interface AnomalyRecord {
  /** 异常唯一标识 */
  id: string;
  /** 关联任务ID */
  taskId: string;
  /** 关联规则ID */
  ruleId: string;
  /** 关联业务主题ID */
  topicId: string;
  /** 异常描述 */
  description: string;
  /** 异常数据标识 */
  dataKey: string;
  /** 异常严重程度 */
  severity: Priority;
  /** 是否已关联工单 */
  ticketed: boolean;
  /** 关联工单ID */
  ticketId?: string;
  /** 发现时间 */
  detectedAt: string;
}

/**
 * 问题工单接口
 */
export interface IssueTicket {
  /** 工单唯一标识 */
  id: string;
  /** 工单标题 */
  title: string;
  /** 工单描述 */
  description: string;
  /** 工单状态 */
  status: TicketStatus;
  /** 优先级 */
  priority: Priority;
  /** 关联业务主题ID */
  topicId: string;
  /** 关联异常ID列表 */
  anomalyIds: string[];
  /** 责任人ID */
  assigneeId: string;
  /** 报告人ID */
  reporterId: string;
  /** SLA截止时间 */
  slaDeadline: string;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

/**
 * 工单活动记录接口
 */
export interface TicketActivity {
  /** 活动唯一标识 */
  id: string;
  /** 关联工单ID */
  ticketId: string;
  /** 活动类型 */
  type: 'status_change' | 'comment' | 'assignment';
  /** 活动内容 */
  content: string;
  /** 操作人ID */
  operatorId: string;
  /** 操作时间 */
  createdAt: string;
}

/**
 * 质量趋势数据点接口
 */
export interface QualityTrendPoint {
  /** 日期 */
  date: string;
  /** 质量分数 */
  score: number;
  /** 异常数量 */
  anomalyCount: number;
  /** 规则执行数 */
  ruleExecutions: number;
}

/**
 * 质量报告接口
 */
export interface QualityReport {
  /** 报告唯一标识 */
  id: string;
  /** 报告周期 (月度/季度/年度) */
  period: string;
  /** 报告月份 YYYY-MM */
  month: string;
  /** 平均质量分数 */
  avgScore: number;
  /** 规则总数 */
  totalRules: number;
  /** 执行任务数 */
  totalTasks: number;
  /** 异常总数 */
  totalAnomalies: number;
  /** 工单数 */
  totalTickets: number;
  /** 已解决工单数 */
  resolvedTickets: number;
  /** 各业务主题得分 */
  topicScores: {
    topicId: string;
    topicName: string;
    score: number;
  }[];
  /** 生成时间 */
  generatedAt: string;
}
