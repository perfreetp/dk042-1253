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

  toggleRuleStatus: (ruleId: string) => void;
  updateRuleThreshold: (ruleId: string, target: number) => void;
  updateRuleWarningThreshold: (ruleId: string, warning: number) => void;

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
        r.id === ruleId ? { ...r, threshold: { ...r.threshold, min: warning } } : r
      ),
    })),

  createTask: (ruleIds, name, triggerType) => {
    const id = `task_${Date.now()}`;
    const ruleId = ruleIds[0];
    const now = new Date().toISOString();
    set((state) => ({
      tasks: [
        {
          id,
          name,
          ruleId,
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
    set((state) => ({
      tickets: state.tickets.map((t) =>
        t.id === ticketId
          ? { ...t, assigneeId, status: TicketStatus.InProgress, updatedAt: new Date().toISOString() }
          : t
      ),
      ticketActivities: [
        ...state.ticketActivities,
        {
          id: `act_${Date.now()}`,
          ticketId,
          type: 'assignment' as const,
          content: `工单已分派给 ${state.users.find((u) => u.id === assigneeId)?.name || assigneeId}`,
          operatorId: 'u001',
          createdAt: new Date().toISOString(),
        },
      ],
    })),

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
          type: 'comment' as const,
          content: `提交处理结果: ${result}`,
          operatorId: state.tickets.find((t) => t.id === ticketId)?.assigneeId || 'u001',
          createdAt: new Date().toISOString(),
        },
      ],
    })),

  requestReview: (ticketId) =>
    set((state) => ({
      tickets: state.tickets.map((t) =>
        t.id === ticketId
          ? { ...t, status: TicketStatus.PendingReview, updatedAt: new Date().toISOString() }
          : t
      ),
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

  RULE_TYPE_LABELS,
  TICKET_STATUS_LABELS,
  PRIORITY_LABELS,
}));
