import { CheckTask, TaskStatus } from '../types';

/**
 * 检查任务模拟数据 - 15条检查任务，不同状态
 */
export const tasks: CheckTask[] = [
  // 待执行任务 (Pending)
  {
    id: 'task001',
    name: '客户姓名必填校验 - 每日巡检',
    ruleId: 'r001',
    status: TaskStatus.Pending,
    progress: 0,
    recordCount: 0,
    anomalyCount: 0,
    executorId: 'u001',
  },
  {
    id: 'task002',
    name: '商品编码完整性检查 - 每日巡检',
    ruleId: 'r003',
    status: TaskStatus.Pending,
    progress: 0,
    recordCount: 0,
    anomalyCount: 0,
    executorId: 'u008',
  },
  {
    id: 'task003',
    name: '订单库存一致性校验',
    ruleId: 'r012',
    status: TaskStatus.Pending,
    progress: 0,
    recordCount: 0,
    anomalyCount: 0,
    executorId: 'u004',
  },

  // 执行中任务 (Running)
  {
    id: 'task004',
    name: '订单金额必填校验 - 小时级检查',
    ruleId: 'r002',
    status: TaskStatus.Running,
    progress: 45,
    startedAt: '2026-06-15T08:00:00Z',
    recordCount: 125000,
    anomalyCount: 0,
    executorId: 'u003',
  },
  {
    id: 'task005',
    name: '订单创建及时性检查',
    ruleId: 'r013',
    status: TaskStatus.Running,
    progress: 72,
    startedAt: '2026-06-15T08:30:00Z',
    recordCount: 86400,
    anomalyCount: 3,
    executorId: 'u003',
  },
  {
    id: 'task006',
    name: '售后响应及时性检查',
    ruleId: 'r016',
    status: TaskStatus.Running,
    progress: 28,
    startedAt: '2026-06-15T08:05:00Z',
    recordCount: 12580,
    anomalyCount: 1,
    executorId: 'u006',
  },

  // 执行成功任务 (Success)
  {
    id: 'task007',
    name: '客户邮箱格式校验 - 昨日巡检',
    ruleId: 'r005',
    status: TaskStatus.Success,
    progress: 100,
    startedAt: '2026-06-14T02:30:00Z',
    finishedAt: '2026-06-14T02:35:12Z',
    recordCount: 586420,
    anomalyCount: 12,
    executorId: 'u001',
  },
  {
    id: 'task008',
    name: '订单客户一致性校验',
    ruleId: 'r009',
    status: TaskStatus.Success,
    progress: 100,
    startedAt: '2026-06-14T01:00:00Z',
    finishedAt: '2026-06-14T01:18:45Z',
    recordCount: 1258960,
    anomalyCount: 8,
    executorId: 'u003',
  },
  {
    id: 'task009',
    name: '财务借贷平衡检查',
    ruleId: 'r011',
    status: TaskStatus.Success,
    progress: 100,
    startedAt: '2026-06-14T07:00:00Z',
    finishedAt: '2026-06-14T07:08:33Z',
    recordCount: 25680,
    anomalyCount: 0,
    executorId: 'u005',
  },
  {
    id: 'task010',
    name: '订单号唯一性校验',
    ruleId: 'r018',
    status: TaskStatus.Success,
    progress: 100,
    startedAt: '2026-06-14T08:00:00Z',
    finishedAt: '2026-06-14T08:12:20Z',
    recordCount: 89650,
    anomalyCount: 2,
    executorId: 'u003',
  },
  {
    id: 'task011',
    name: '商品分类一致性检查',
    ruleId: 'r010',
    status: TaskStatus.Success,
    progress: 100,
    startedAt: '2026-06-14T03:30:00Z',
    finishedAt: '2026-06-14T03:34:18Z',
    recordCount: 425680,
    anomalyCount: 15,
    executorId: 'u008',
  },

  // 执行失败任务 (Failed)
  {
    id: 'task012',
    name: '订单金额范围校验',
    ruleId: 'r006',
    status: TaskStatus.Failed,
    progress: 68,
    startedAt: '2026-06-15T06:00:00Z',
    finishedAt: '2026-06-15T06:25:40Z',
    recordCount: 58960,
    anomalyCount: 0,
    executorId: 'u003',
  },
  {
    id: 'task013',
    name: '库存数量准确性检查',
    ruleId: 'r008',
    status: TaskStatus.Failed,
    progress: 35,
    startedAt: '2026-06-14T05:00:00Z',
    finishedAt: '2026-06-14T05:12:05Z',
    recordCount: 125680,
    anomalyCount: 0,
    executorId: 'u004',
  },
  {
    id: 'task014',
    name: '物流信息更新及时性检查',
    ruleId: 'r015',
    status: TaskStatus.Failed,
    progress: 82,
    startedAt: '2026-06-15T06:00:00Z',
    finishedAt: '2026-06-15T06:38:22Z',
    recordCount: 8960,
    anomalyCount: 12,
    executorId: 'u004',
  },
  {
    id: 'task015',
    name: '客户手机号唯一性检查',
    ruleId: 'r017',
    status: TaskStatus.Failed,
    progress: 12,
    startedAt: '2026-06-14T02:15:00Z',
    finishedAt: '2026-06-14T02:18:08Z',
    recordCount: 25600,
    anomalyCount: 0,
    executorId: 'u001',
  },
];

/**
 * 根据任务ID获取检查任务
 */
export const getTaskById = (id: string): CheckTask | undefined => {
  return tasks.find((t) => t.id === id);
};

/**
 * 根据规则ID获取任务列表
 */
export const getTasksByRuleId = (ruleId: string): CheckTask[] => {
  return tasks.filter((t) => t.ruleId === ruleId);
};
