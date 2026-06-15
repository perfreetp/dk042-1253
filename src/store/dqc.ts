import { create } from 'zustand';
import {
  QualityRule,
  RuleType,
  RuleStatus,
  CheckTask,
  TaskStatus,
  IssueTicket,
  TicketStatus,
  Priority,
  AnomalyRecord,
  BusinessTopic,
  User,
  QualityTrendPoint,
  TicketActivity,
} from '@/data/types';
import { rules as initialRules } from '@/data/mock/rules';
import { tasks as initialTasks } from '@/data/mock/tasks';
import { tickets as initialTickets } from '@/data/mock/tickets';
import { anomalies as initialAnomalies } from '@/data/mock/anomalies';
import { topics as initialTopics } from '@/data/mock/topics';
import { users as initialUsers } from '@/data/mock/users';
import { qualityTrendData } from '@/data/mock/reports';

const RULE_TYPE_LABELS: Record<RuleType, string> = {
  [RuleType.Completeness]: '完整性',
  [RuleType.Accuracy]: '准确性',
  [RuleType.Consistency]: '一致性',
  [RuleType.Timeliness]: '及时性',
  [RuleType.Uniqueness]: '唯一性',
};

const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  [TicketStatus.Open]: '待处理',
  [TicketStatus.InProgress]: '处理中',
  [TicketStatus.PendingReview]: '待复检',
  [TicketStatus.Resolved]: '已解决',
  [TicketStatus.Closed]: '已关闭',
};

const PRIORITY_LABELS: Record<Priority, string> = {
  [Priority.Critical]: '紧急',
  [Priority.High]: '高',
  [Priority.Medium]: '中',
  [Priority.Low]: '低',
};

interface FilteredStats {
  overallScore: number;
  ruleCount: number;
  taskCount: number;
  anomalyCount: number;
  ticketStats: {
    total: number;
    open: number;
    inProgress: number;
    pendingReview: number;
    resolved: number;
    closed: number;
  };
  topicScores: {
    topicId: string;
    topicName: string;
    score: number;
  }[];
  trendData: QualityTrendPoint[];
}

interface DQCStore {
  rules: QualityRule[];
  tasks: CheckTask[];
  tickets: IssueTicket[];
  anomalies: AnomalyRecord[];
  topics: BusinessTopic[];
  users: User[];
  trendData: QualityTrendPoint[];
  ticketActivities: TicketActivity[];

  getTopicById: (id: string) => BusinessTopic | undefined;
  getUserById: (id: string) => User | undefined;
  getRuleById: (id: string) => QualityRule | undefined;
  getRulesByTopic: (topicId: string) => QualityRule[];
  getTaskById: (id: string) => CheckTask | undefined;
  getTicketById: (id: string) => IssueTicket | undefined;
  getAnomaliesByTaskId: (taskId: string) => AnomalyRecord[];
  getAnomaliesByTicketId: (ticketId: string) => AnomalyRecord[];
  getActivitiesByTicketId: (ticketId: string) => TicketActivity[];

  getTopicsByDepartment: (dept: string) => BusinessTopic[];
  getTopicsBySystem: (sys: string) => BusinessTopic[];
  getRulesByTopicIds: (topicIds: string[]) => QualityRule[];
  getAnomaliesByRuleIds: (ruleIds: string[]) => AnomalyRecord[];

  toggleRuleStatus: (ruleId: string) => void;
  updateRuleThreshold: (ruleId: string, target: number) => void;
  updateRuleWarningThreshold: (ruleId: string, warning: number) => void;
  updateRuleThresholdFull: (ruleId: string, thresholds: { min?: number; max?: number; target?: number; warning?: number }) => void;

  createTask: (ruleIds: string[], name: string, triggerType: 'manual' | 'scheduled') => string;
  simulateTaskProgress: (taskId: string) => void;

  assignTicket: (ticketId: string, assigneeId: string) => void;
  startProcessing: (ticketId: string) => void;
  submitResolution: (ticketId: string, result: string) => void;
  requestReview: (ticketId: string) => void;
  approveReview: (ticketId: string) => void;
  rejectReview: (ticketId: string) => void;

  ruleStats: () => { total: number; enabled: number; disabled: number; pending: number };
  taskStats: () => { total: number; running: number; success: number; failed: number; pending: number };
  ticketStats: () => { total: number; open: number; inProgress: number; pendingReview: number; resolved: number; closed: number };
  overallQualityScore: () => number;

  getFilteredStats: (filters: { department?: string; system?: string; ruleType?: RuleType }) => FilteredStats;

  RULE_TYPE_LABELS: typeof RULE_TYPE_LABELS;
  TICKET_STATUS_LABELS: typeof TICKET_STATUS_LABELS;
  PRIORITY_LABELS: typeof PRIORITY_LABELS;
}

export const useDQCStore = create<DQCStore>((set, get) => ({
  rules: [...initialRules],
  tasks: [...initialTasks],
  tickets: [...initialTickets],
  anomalies: [...initialAnomalies],
  topics: [...initialTopics],
  users: [...initialUsers],
  trendData: [...qualityTrendData],
  ticketActivities: [],

  getTopicById: (id) => get().topics.find((t) => t.id === id),
  getUserById: (id) => get().users.find((u) => u.id === id),
  getRuleById: (id) => get().rules.find((r) => r.id === id),
  getRulesByTopic: (topicId) => get().rules.filter((r) => r.topicId === topicId),
  getTaskById: (id) => get().tasks.find((t) => t.id === id),
  getTicketById: (id) => get().tickets.find((t) => t.id === id),
  getAnomaliesByTaskId: (taskId) => get().anomalies.filter((a) => a.taskId === taskId),
  getAnomaliesByTicketId: (ticketId) => get().anomalies.filter((a) => a.ticketId === ticketId),
  getActivitiesByTicketId: (ticketId) => get().ticketActivities.filter((a) => a.ticketId === ticketId),

  getTopicsByDepartment: (dept) => get().topics.filter((t) => t.department === dept),
  getTopicsBySystem: (sys) => get().topics.filter((t) => t.system === sys),
  getRulesByTopicIds: (topicIds) => get().rules.filter((r) => topicIds.includes(r.topicId)),
  getAnomaliesByRuleIds: (ruleIds) => get().anomalies.filter((a) => ruleIds.includes(a.ruleId)),

  toggleRuleStatus: (ruleId) =>
    set((state) => ({
      rules: state.rules.map((r) =>
        r.id === ruleId
          ? { ...r, status: r.status === RuleStatus.Enabled ? RuleStatus.Disabled : RuleStatus.Enabled }
          : r
      ),
    })),

  updateRuleThreshold: (ruleId, target) =>
    set((state) => ({
      rules: state.rules.map((r) =>
        r.id === ruleId ? { ...r, threshold: { ...r.threshold, target } } : r
      ),
    })),

  updateRuleWarningThreshold: (ruleId, warning) =>
    set((state) => ({
      rules: state.rules.map((r) =>
        r.id === ruleId ? { ...r, threshold: { ...r.threshold, warning } } : r
      ),
    })),

  updateRuleThresholdFull: (ruleId, thresholds) =>
    set((state) => ({
      rules: state.rules.map((r) =>
        r.id === ruleId
          ? {
              ...r,
              threshold: {
                ...r.threshold,
                ...(thresholds.min !== undefined ? { min: thresholds.min } : {}),
                ...(thresholds.max !== undefined ? { max: thresholds.max } : {}),
                ...(thresholds.target !== undefined ? { target: thresholds.target } : {}),
                ...(thresholds.warning !== undefined ? { warning: thresholds.warning } : {}),
              },
            }
          : r
      ),
    })),

  createTask: (ruleIds, name, triggerType) => {
    const id = `task_${Date.now()}`;
    const now = new Date().toISOString();
    set((state) => ({
      tasks: [
        {
          id,
          name,
          ruleIds,
          triggerType,
          status: TaskStatus.Running,
          progress: 0,
          startedAt: now,
          recordCount: 0,
          anomalyCount: 0,
          executorId: 'u001',
        },
        ...state.tasks,
      ],
    }));
    return id;
  },

  simulateTaskProgress: (taskId) =>
    set((state) => ({
      tasks: state.tasks.map((t) => {
        if (t.id !== taskId || t.status !== TaskStatus.Running) return t;
        const newProgress = Math.min(100, t.progress + Math.floor(Math.random() * 20) + 5);
        const isComplete = newProgress >= 100;
        const anomalyCount = isComplete ? Math.floor(Math.random() * 15) : t.anomalyCount;
        const recordCount = isComplete ? Math.floor(Math.random() * 500000) + 10000 : Math.floor(Math.random() * 200000) + 5000;
        return {
          ...t,
          progress: newProgress,
          status: isComplete ? TaskStatus.Success : TaskStatus.Running,
          finishedAt: isComplete ? new Date().toISOString() : t.finishedAt,
          anomalyCount,
          recordCount,
        };
      }),
    })),

  assignTicket: (ticketId, assigneeId) =>
    set((state) => {
      const assigneeName = state.users.find((u) => u.id === assigneeId)?.name || assigneeId;
      return {
        tickets: state.tickets.map((t) =>
          t.id === ticketId
            ? { ...t, assigneeId, updatedAt: new Date().toISOString() }
            : t
        ),
        ticketActivities: [
          ...state.ticketActivities,
          {
            id: `act_${Date.now()}`,
            ticketId,
            type: 'assignment' as const,
            content: `工单已分派给 ${assigneeName}`,
            operatorId: 'u001',
            createdAt: new Date().toISOString(),
          },
        ],
      };
    }),

  startProcessing: (ticketId) =>
    set((state) => {
      const ticket = state.tickets.find((t) => t.id === ticketId);
      if (!ticket) return state;
      return {
        tickets: state.tickets.map((t) =>
          t.id === ticketId
            ? { ...t, status: TicketStatus.InProgress, updatedAt: new Date().toISOString() }
            : t
        ),
        ticketActivities: [
          ...state.ticketActivities,
          {
            id: `act_${Date.now()}`,
            ticketId,
            type: 'status_change' as const,
            content: '开始处理工单',
            operatorId: ticket.assigneeId || 'u001',
            createdAt: new Date().toISOString(),
          },
        ],
      };
    }),

  submitResolution: (ticketId, result) =>
    set((state) => {
      const ticket = state.tickets.find((t) => t.id === ticketId);
      return {
        tickets: state.tickets.map((t) =>
          t.id === ticketId
            ? { ...t, status: TicketStatus.PendingReview, updatedAt: new Date().toISOString() }
            : t
        ),
        ticketActivities: [
          ...state.ticketActivities,
          {
            id: `act_${Date.now()}`,
            ticketId,
            type: 'comment' as const,
            content: `提交处理结果: ${result}`,
            operatorId: ticket?.assigneeId || 'u001',
            createdAt: new Date().toISOString(),
          },
          {
            id: `act_${Date.now()}_status`,
            ticketId,
            type: 'status_change' as const,
            content: '工单状态变更为待复检',
            operatorId: ticket?.assigneeId || 'u001',
            createdAt: new Date().toISOString(),
          },
        ],
      };
    }),

  requestReview: (ticketId) =>
    set((state) => ({
      tickets: state.tickets.map((t) =>
        t.id === ticketId
          ? { ...t, status: TicketStatus.PendingReview, updatedAt: new Date().toISOString() }
          : t
      ),
      ticketActivities: [
        ...state.ticketActivities,
        {
          id: `act_${Date.now()}`,
          ticketId,
          type: 'status_change' as const,
          content: '申请复检，工单状态变更为待复检',
          operatorId: 'u001',
          createdAt: new Date().toISOString(),
        },
      ],
    })),

  approveReview: (ticketId) =>
    set((state) => ({
      tickets: state.tickets.map((t) =>
        t.id === ticketId
          ? { ...t, status: TicketStatus.Closed, updatedAt: new Date().toISOString() }
          : t
      ),
      ticketActivities: [
        ...state.ticketActivities,
        {
          id: `act_${Date.now()}`,
          ticketId,
          type: 'status_change' as const,
          content: '复检通过，工单已关闭',
          operatorId: 'u001',
          createdAt: new Date().toISOString(),
        },
      ],
    })),

  rejectReview: (ticketId) =>
    set((state) => ({
      tickets: state.tickets.map((t) =>
        t.id === ticketId
          ? { ...t, status: TicketStatus.InProgress, updatedAt: new Date().toISOString() }
          : t
      ),
      ticketActivities: [
        ...state.ticketActivities,
        {
          id: `act_${Date.now()}`,
          ticketId,
          type: 'status_change' as const,
          content: '复检未通过，工单退回处理',
          operatorId: 'u001',
          createdAt: new Date().toISOString(),
        },
      ],
    })),

  ruleStats: () => {
    const { rules } = get();
    return {
      total: rules.length,
      enabled: rules.filter((r) => r.status === RuleStatus.Enabled).length,
      disabled: rules.filter((r) => r.status === RuleStatus.Disabled).length,
      pending: rules.filter((r) => r.status === RuleStatus.Pending).length,
    };
  },

  taskStats: () => {
    const { tasks } = get();
    return {
      total: tasks.length,
      running: tasks.filter((t) => t.status === TaskStatus.Running).length,
      success: tasks.filter((t) => t.status === TaskStatus.Success).length,
      failed: tasks.filter((t) => t.status === TaskStatus.Failed).length,
      pending: tasks.filter((t) => t.status === TaskStatus.Pending).length,
    };
  },

  ticketStats: () => {
    const { tickets } = get();
    return {
      total: tickets.length,
      open: tickets.filter((t) => t.status === TicketStatus.Open).length,
      inProgress: tickets.filter((t) => t.status === TicketStatus.InProgress).length,
      pendingReview: tickets.filter((t) => t.status === TicketStatus.PendingReview).length,
      resolved: tickets.filter((t) => t.status === TicketStatus.Resolved).length,
      closed: tickets.filter((t) => t.status === TicketStatus.Closed).length,
    };
  },

  overallQualityScore: () => {
    const { topics } = get();
    if (topics.length === 0) return 0;
    return Math.round(topics.reduce((sum, t) => sum + t.score, 0) / topics.length * 10) / 10;
  },

  getFilteredStats: (filters) => {
    const { topics, rules, tasks, anomalies, tickets, trendData } = get();
    const { department, system, ruleType } = filters;

    let filteredTopics = [...topics];
    if (department) {
      filteredTopics = filteredTopics.filter((t) => t.department === department);
    }
    if (system) {
      filteredTopics = filteredTopics.filter((t) => t.system === system);
    }

    const topicIds = filteredTopics.map((t) => t.id);

    let filteredRules = rules.filter((r) => topicIds.includes(r.topicId));
    if (ruleType) {
      filteredRules = filteredRules.filter((r) => r.type === ruleType);
    }

    const ruleIds = filteredRules.map((r) => r.id);

    const filteredAnomalies = anomalies.filter((a) => ruleIds.includes(a.ruleId));

    const filteredTasks = tasks.filter((t) => {
      const taskRuleIds = (t as any).ruleId ? [(t as any).ruleId] : (t.ruleIds || []);
      return taskRuleIds.some((rid: string) => ruleIds.includes(rid));
    });

    const filteredTickets = tickets.filter((t) => topicIds.includes(t.topicId));

    const overallScore =
      filteredTopics.length > 0
        ? Math.round(filteredTopics.reduce((sum, t) => sum + t.score, 0) / filteredTopics.length * 10) / 10
        : 0;

    const ticketStatsResult = {
      total: filteredTickets.length,
      open: filteredTickets.filter((t) => t.status === TicketStatus.Open).length,
      inProgress: filteredTickets.filter((t) => t.status === TicketStatus.InProgress).length,
      pendingReview: filteredTickets.filter((t) => t.status === TicketStatus.PendingReview).length,
      resolved: filteredTickets.filter((t) => t.status === TicketStatus.Resolved).length,
      closed: filteredTickets.filter((t) => t.status === TicketStatus.Closed).length,
    };

    const topicScores = filteredTopics.map((t) => ({
      topicId: t.id,
      topicName: t.name,
      score: t.score,
    }));

    return {
      overallScore,
      ruleCount: filteredRules.length,
      taskCount: filteredTasks.length,
      anomalyCount: filteredAnomalies.length,
      ticketStats: ticketStatsResult,
      topicScores,
      trendData,
    };
  },

  RULE_TYPE_LABELS,
  TICKET_STATUS_LABELS,
  PRIORITY_LABELS,
}));
