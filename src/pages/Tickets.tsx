import { useState, useMemo } from 'react';
import {
  User as UserIcon,
  Clock,
  AlertTriangle,
  Search,
  ChevronRight,
  FileText,
  Tag,
  Activity,
  ShieldCheck,
  Ban,
  ClipboardList,
  CheckCircle2,
  BarChart3,
  UserCheck,
  Info,
} from 'lucide-react';
import { useDQCStore } from '@/store/dqc';
import { Drawer } from '@/components/ui/Drawer';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TicketStatus, Priority } from '@/data/types';
import { formatDateTime } from '@/utils/format';
import { cn } from '@/lib/utils';

const PRIORITY_CONFIG: Record<Priority, { label: string; borderClass: string; variant: 'danger' | 'warning' | 'info' | 'default' }> = {
  [Priority.Critical]: { label: '紧急', borderClass: 'border-l-danger-500', variant: 'danger' },
  [Priority.High]: { label: '高', borderClass: 'border-l-gold-500', variant: 'warning' },
  [Priority.Medium]: { label: '中', borderClass: 'border-l-cyan-500', variant: 'info' },
  [Priority.Low]: { label: '低', borderClass: 'border-l-slate-400', variant: 'default' },
};

const STATUS_CONFIG: Record<TicketStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'info' }> = {
  [TicketStatus.Open]: { label: '待处理', variant: 'default' },
  [TicketStatus.InProgress]: { label: '处理中', variant: 'info' },
  [TicketStatus.PendingReview]: { label: '待复检', variant: 'warning' },
  [TicketStatus.Resolved]: { label: '已解决', variant: 'success' },
  [TicketStatus.Closed]: { label: '已关闭', variant: 'default' },
};

const ACTIVITY_DOT: Record<string, { label: string; dotClass: string }> = {
  status_change: { label: '状态变更', dotClass: 'bg-cyan-500' },
  comment: { label: '处理结果', dotClass: 'bg-gold-500' },
  assignment: { label: '分派', dotClass: 'bg-navy-500' },
};

const SEVERITY_CONFIG: Record<Priority, { label: string; class: string }> = {
  [Priority.Critical]: { label: '严重', class: 'text-danger-600' },
  [Priority.High]: { label: '高', class: 'text-gold-600' },
  [Priority.Medium]: { label: '中', class: 'text-cyan-600' },
  [Priority.Low]: { label: '低', class: 'text-slate-500' },
};

function computeSLA(slaDeadline: string): { text: string; urgent: boolean } {
  const diff = new Date(slaDeadline).getTime() - Date.now();
  if (diff <= 0) return { text: '已超期', urgent: true };
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const urgent = hours < 24;
  if (hours >= 48) {
    const days = Math.floor(hours / 24);
    return { text: `${days}天${hours % 24}小时`, urgent };
  }
  return { text: `${hours}小时${minutes}分钟`, urgent };
}

export default function Tickets() {
  const store = useDQCStore();
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [resolution, setResolution] = useState('');

  const stats = store.ticketStats();

  const filteredTickets = useMemo(() => {
    let list = store.tickets;
    if (statusFilter !== 'all') list = list.filter((t) => t.status === statusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((t) => t.id.toLowerCase().includes(q) || t.title.toLowerCase().includes(q));
    }
    return list;
  }, [store.tickets, statusFilter, searchQuery]);

  const selectedTicket = selectedTicketId ? store.getTicketById(selectedTicketId) : null;
  const ticketAnomalies = selectedTicketId ? store.getAnomaliesByTicketId(selectedTicketId) : [];
  const ticketActivities = selectedTicketId ? store.getActivitiesByTicketId(selectedTicketId) : [];
  const ticketTopic = selectedTicket?.topicId ? store.getTopicById(selectedTicket.topicId) : null;
  const ticketAssignee = selectedTicket?.assigneeId ? store.getUserById(selectedTicket.assigneeId) : null;
  const ticketReporter = selectedTicket?.reporterId ? store.getUserById(selectedTicket.reporterId) : null;

  const sortedActivities = useMemo(() => {
    return [...ticketActivities].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [ticketActivities]);

  const handleAssign = () => {
    if (!selectedTicketId || !assigneeId) return;
    store.assignTicket(selectedTicketId, assigneeId);
    setAssigneeId('');
  };

  const handleStart = () => {
    if (!selectedTicketId) return;
    store.startProcessing(selectedTicketId);
  };

  const handleSubmit = () => {
    if (!selectedTicketId || !resolution.trim()) return;
    store.submitResolution(selectedTicketId, resolution.trim());
    setResolution('');
  };

  const handleApprove = () => {
    if (!selectedTicketId) return;
    store.approveReview(selectedTicketId);
  };

  const handleReject = () => {
    if (!selectedTicketId) return;
    store.rejectReview(selectedTicketId);
  };

  const handleResolveToClosed = () => {
    if (!selectedTicketId) return;
    store.resolveToClosed(selectedTicketId);
  };

  const closeDrawer = () => {
    setSelectedTicketId(null);
    setAssigneeId('');
    setResolution('');
  };

  const statusFilters: { key: TicketStatus | 'all'; label: string; count: number }[] = [
    { key: 'all', label: '全部', count: stats.total },
    { key: TicketStatus.Open, label: '待处理', count: stats.open },
    { key: TicketStatus.InProgress, label: '处理中', count: stats.inProgress },
    { key: TicketStatus.PendingReview, label: '待复检', count: stats.pendingReview },
    { key: TicketStatus.Resolved, label: '已解决', count: stats.resolved },
    { key: TicketStatus.Closed, label: '已关闭', count: stats.closed },
  ];

  const renderFooter = () => {
    if (!selectedTicket) return null;

    switch (selectedTicket.status) {
      case TicketStatus.Open:
        return (
          <div className="flex items-center gap-3 w-full">
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="flex-1 h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 bg-white"
            >
              <option value="">选择责任人...</option>
              {store.users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} - {u.department}
                </option>
              ))}
            </select>
            <Button onClick={handleAssign} disabled={!assigneeId} size="md">
              分派
            </Button>
            {selectedTicket.assigneeId && (
              <Button onClick={handleStart} variant="secondary" size="md">
                开始处理
              </Button>
            )}
          </div>
        );

      case TicketStatus.InProgress:
        return (
          <div className="flex items-end gap-3 w-full">
            <textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="填写处理结果..."
              rows={2}
              className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400"
            />
            <Button onClick={handleSubmit} disabled={!resolution.trim()} size="md">
              提交并请求复检
            </Button>
          </div>
        );

      case TicketStatus.PendingReview:
        return (
          <div className="flex items-center gap-3 w-full">
            <Button onClick={handleApprove} variant="primary" size="md" className="flex-1">
              <ShieldCheck className="w-4 h-4" />
              复检通过 - 关闭工单
            </Button>
            <Button onClick={handleReject} variant="secondary" size="md" className="flex-1">
              <Ban className="w-4 h-4" />
              复检驳回 - 退回处理
            </Button>
          </div>
        );

      case TicketStatus.Resolved:
        return (
          <div className="space-y-3 w-full">
            <div className="flex items-center gap-2 text-sm text-gold-700 bg-gold-50 px-3 py-2 rounded-lg">
              <Info className="w-4 h-4 flex-shrink-0" />
              <span>该工单为已解决状态，可确认关闭</span>
            </div>
            <div className="flex items-center gap-3 w-full">
              <Button onClick={handleResolveToClosed} variant="primary" size="md" className="flex-1">
                <CheckCircle2 className="w-4 h-4" />
                确认关闭工单
              </Button>
              <Button onClick={handleReject} variant="secondary" size="md" className="flex-1">
                <Ban className="w-4 h-4" />
                复检驳回 - 退回处理
              </Button>
            </div>
          </div>
        );

      case TicketStatus.Closed:
        return (
          <div className="w-full text-center py-2">
            <span className="text-sm text-slate-500">工单已关闭</span>
          </div>
        );

      default:
        return null;
    }
  };

  const footerContent = renderFooter();

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">问题工单</h1>
          <p className="text-sm text-slate-500 mt-1">追踪和处理数据质量问题，指派责任人并跟进进度</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          title="全部工单"
          value={stats.total}
          icon={<ClipboardList className="w-5 h-5" />}
          accentColor="navy"
        />
        <StatCard
          title="待处理"
          value={stats.open}
          icon={<Clock className="w-5 h-5" />}
          accentColor="danger"
        />
        <StatCard
          title="处理中"
          value={stats.inProgress}
          icon={<BarChart3 className="w-5 h-5" />}
          accentColor="cyan"
        />
        <StatCard
          title="待复检"
          value={stats.pendingReview}
          icon={<UserCheck className="w-5 h-5" />}
          accentColor="gold"
        />
        <StatCard
          title="已关闭"
          value={stats.closed + stats.resolved}
          icon={<CheckCircle2 className="w-5 h-5" />}
          accentColor="success"
        />
      </div>

      <div className="bg-white rounded-xl shadow-card border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 space-y-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索工单号、标题..."
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {statusFilters.map((f) => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                  statusFilter === f.key
                    ? 'bg-navy-50 text-navy-700'
                    : 'text-slate-500 hover:bg-slate-100'
                )}
              >
                {f.label}
                <span className="ml-1.5 text-[10px] opacity-70">{f.count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-50">
          {filteredTickets.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-400">暂无匹配的工单</div>
          ) : (
            filteredTickets.map((ticket) => {
              const prio = PRIORITY_CONFIG[ticket.priority];
              const stat = STATUS_CONFIG[ticket.status];
              const sla = computeSLA(ticket.slaDeadline);
              const assignee = store.getUserById(ticket.assigneeId);
              const statusBadgeVariant = ticket.status === TicketStatus.Resolved
                ? 'success'
                : ticket.status === TicketStatus.Closed
                  ? 'default'
                  : stat.variant;
              return (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className={cn(
                    'flex items-stretch cursor-pointer hover:bg-slate-50/50 transition-colors border-l-4',
                    prio.borderClass
                  )}
                >
                  <div className="flex-1 p-5 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="font-mono text-xs text-navy-600 font-medium">
                        {ticket.id}
                      </span>
                      <Badge variant={prio.variant}>{prio.label}</Badge>
                      <Badge variant={statusBadgeVariant}>{stat.label}</Badge>
                    </div>
                    <h4 className="font-medium text-slate-800 mb-3">{ticket.title}</h4>
                    <div className="flex items-center gap-5 text-xs text-slate-500 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <UserIcon className="w-3.5 h-3.5" />
                        <span>{assignee?.name || '未分派'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span className={cn(sla.urgent && 'text-danger-600 font-medium')}>
                          SLA: {sla.text}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>影响数据: {ticket.anomalyIds.length} 条</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center pr-4">
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <Drawer
        open={!!selectedTicketId}
        onClose={closeDrawer}
        title={selectedTicket ? `${selectedTicket.id} 工单详情` : ''}
        size="xl"
        footer={
          footerContent ? (
            <div className="w-full bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.08)] -mx-6 -my-4 px-6 py-4 rounded-none">
              {footerContent}
            </div>
          ) : undefined
        }
      >
        {selectedTicket && (
          <div className="space-y-6 pb-4">
            <section>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-slate-800 mb-3">{selectedTicket.title}</h2>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant={PRIORITY_CONFIG[selectedTicket.priority].variant} withDot>
                    {PRIORITY_CONFIG[selectedTicket.priority].label}优先级
                  </Badge>
                  <Badge
                    variant={
                      selectedTicket.status === TicketStatus.Resolved
                        ? 'success'
                        : selectedTicket.status === TicketStatus.Closed
                          ? 'default'
                          : STATUS_CONFIG[selectedTicket.status].variant
                    }
                    withDot
                  >
                    {STATUS_CONFIG[selectedTicket.status].label}
                  </Badge>
                  <span className="text-xs text-slate-400 font-mono">{selectedTicket.id}</span>
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{selectedTicket.description}</p>
            </section>

            <section className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-xs text-slate-400">创建时间</span>
                <p className="text-sm text-slate-700">{formatDateTime(selectedTicket.createdAt)}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-400">SLA截止时间</span>
                <p
                  className={cn(
                    'text-sm',
                    computeSLA(selectedTicket.slaDeadline).urgent
                      ? 'text-danger-600 font-medium'
                      : 'text-slate-700'
                  )}
                >
                  {formatDateTime(selectedTicket.slaDeadline)}
                  <span className="ml-2 text-xs text-slate-400">
                    ({computeSLA(selectedTicket.slaDeadline).text})
                  </span>
                </p>
              </div>
            </section>

            <section>
              <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-navy-500" />
                人员信息
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-navy-100 flex items-center justify-center text-navy-700 text-sm font-medium">
                    {ticketReporter?.name.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">报告人</p>
                    <p className="text-sm font-medium text-slate-800">
                      {ticketReporter?.name || '未知'}
                    </p>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 text-sm font-medium">
                    {ticketAssignee?.name.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">责任人</p>
                    <p className="text-sm font-medium text-slate-800">
                      {ticketAssignee?.name || '未分派'}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {ticketTopic && (
              <section>
                <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-navy-500" />
                  关联主题
                </h4>
                <div className="p-4 bg-slate-50 rounded-lg space-y-2">
                  <p className="text-sm font-medium text-slate-800">{ticketTopic.name}</p>
                  <p className="text-xs text-slate-500">{ticketTopic.description}</p>
                  <div className="flex items-center gap-4 pt-2">
                    <div>
                      <span className="text-xs text-slate-400">所属系统</span>
                      <p className="text-sm text-slate-700">{ticketTopic.system}</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400">所属部门</span>
                      <p className="text-sm text-slate-700">{ticketTopic.department}</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400">质量分</span>
                      <p className="text-sm font-medium text-navy-600">{ticketTopic.score}</p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {ticketAnomalies.length > 0 && (
              <section>
                <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-navy-500" />
                  关联异常
                  <span className="text-xs text-slate-400 font-normal">
                    ({ticketAnomalies.length})
                  </span>
                </h4>
                <div className="space-y-2">
                  {ticketAnomalies.map((a) => {
                    const rule = store.getRuleById(a.ruleId);
                    return (
                      <div key={a.id} className="p-3 bg-slate-50 rounded-lg space-y-1.5">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-slate-700">{a.description}</p>
                          <span
                            className={cn(
                              'text-xs font-medium',
                              SEVERITY_CONFIG[a.severity]?.class || 'text-slate-500'
                            )}
                          >
                            {SEVERITY_CONFIG[a.severity]?.label || a.severity}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div>
                            <span className="text-[10px] text-slate-400">数据标识</span>
                            <p className="text-xs text-slate-600 font-mono">{a.dataKey}</p>
                          </div>
                          {rule && (
                            <div>
                              <span className="text-[10px] text-slate-400">所属规则</span>
                              <p className="text-xs text-slate-600">{rule.name}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            <section>
              <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-navy-500" />
                活动时间线
              </h4>
              {sortedActivities.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center">暂无活动记录</p>
              ) : (
                <div className="relative pl-6">
                  <div className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-200" />
                  {sortedActivities.map((act) => {
                    const cfg = ACTIVITY_DOT[act.type] || {
                      label: act.type,
                      dotClass: 'bg-slate-400',
                    };
                    const operator = store.getUserById(act.operatorId);
                    return (
                      <div key={act.id} className="relative pb-4 last:pb-0">
                        <div
                          className={cn(
                            'absolute left-[-20px] top-1.5 w-[9px] h-[9px] rounded-full border-2 border-white',
                            cfg.dotClass
                          )}
                        />
                        <div className="bg-slate-50 rounded-lg p-3">
                          <p className="text-sm text-slate-700">{act.content}</p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] px-1.5 py-0.5 bg-white border border-slate-200 text-slate-500 rounded">
                                {cfg.label}
                              </span>
                              {operator && (
                                <span className="text-xs text-slate-500">
                                  {operator.name}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-400 whitespace-nowrap">
                              {formatDateTime(act.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}
      </Drawer>
    </div>
  );
}
