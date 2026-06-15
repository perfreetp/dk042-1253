import { useState, useMemo, useCallback } from "react";
import { Search, ChevronDown, ChevronRight, Clock } from "lucide-react";
import { useDQCStore } from "@/store/dqc";
import { Switch } from "@/components/ui/Switch";
import { RuleType, RuleStatus, QualityRule } from "@/data/types";
import { cn } from "@/lib/utils";

const TYPE_COLOR_MAP: Record<RuleType, { bar: string; badge: string; text: string }> = {
  [RuleType.Completeness]: { bar: "bg-cyan-500", badge: "bg-cyan-50 text-cyan-700", text: "text-cyan-700" },
  [RuleType.Accuracy]: { bar: "bg-gold-500", badge: "bg-gold-50 text-gold-700", text: "text-gold-700" },
  [RuleType.Consistency]: { bar: "bg-navy-500", badge: "bg-navy-50 text-navy-700", text: "text-navy-700" },
  [RuleType.Timeliness]: { bar: "bg-success-500", badge: "bg-success-50 text-success-700", text: "text-success-700" },
  [RuleType.Uniqueness]: { bar: "bg-danger-500", badge: "bg-danger-50 text-danger-700", text: "text-danger-700" },
};

const STATUS_LABELS: Record<RuleStatus, string> = {
  [RuleStatus.Enabled]: "启用",
  [RuleStatus.Disabled]: "停用",
  [RuleStatus.Pending]: "待审核",
};

const STATUS_BADGE: Record<RuleStatus, string> = {
  [RuleStatus.Enabled]: "bg-success-50 text-success-700",
  [RuleStatus.Disabled]: "bg-slate-100 text-slate-600",
  [RuleStatus.Pending]: "bg-gold-50 text-gold-700",
};

const RULE_TYPE_ORDER: RuleType[] = [
  RuleType.Completeness,
  RuleType.Accuracy,
  RuleType.Consistency,
  RuleType.Timeliness,
  RuleType.Uniqueness,
];

type StatusFilter = "all" | "enabled" | "disabled" | "pending";

interface ThresholdInputProps {
  label: string;
  value?: number;
  unit?: string;
  onBlur: (value: number | undefined) => void;
}

function ThresholdInput({ label, value, unit, onBlur }: ThresholdInputProps) {
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (isNaN(val)) {
      onBlur(undefined);
    } else {
      onBlur(val);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-slate-500">{label}</label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          defaultValue={value}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-20 px-2 py-1.5 border border-slate-200 rounded-md text-sm text-center tabular-nums focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 bg-white"
        />
        {unit && <span className="text-xs text-slate-500">{unit}</span>}
      </div>
    </div>
  );
}

interface RuleThresholdEditorProps {
  rule: QualityRule;
  onUpdate: (thresholds: { min?: number; max?: number; target?: number; warning?: number }) => void;
}

function RuleThresholdEditor({ rule, onUpdate }: RuleThresholdEditorProps) {
  const { type, threshold } = rule;

  const handleMinBlur = useCallback(
    (val: number | undefined) => {
      onUpdate({ min: val });
    },
    [onUpdate]
  );

  const handleMaxBlur = useCallback(
    (val: number | undefined) => {
      onUpdate({ max: val });
    },
    [onUpdate]
  );

  const handleTargetBlur = useCallback(
    (val: number | undefined) => {
      onUpdate({ target: val });
    },
    [onUpdate]
  );

  const handleWarningBlur = useCallback(
    (val: number | undefined) => {
      onUpdate({ warning: val });
    },
    [onUpdate]
  );

  if (type === RuleType.Accuracy) {
    return (
      <div className="bg-slate-50 rounded-lg p-3 space-y-3">
        <p className="text-xs font-medium text-slate-600">阈值配置</p>
        <div className="grid grid-cols-2 gap-3">
          <ThresholdInput label="最小值" value={threshold.min} onBlur={handleMinBlur} />
          <ThresholdInput label="最大值" value={threshold.max} onBlur={handleMaxBlur} />
          <ThresholdInput label="目标合格率" value={threshold.target} unit="%" onBlur={handleTargetBlur} />
          <ThresholdInput label="告警阈值" value={threshold.warning} unit="%" onBlur={handleWarningBlur} />
        </div>
      </div>
    );
  }

  if (type === RuleType.Timeliness) {
    return (
      <div className="bg-slate-50 rounded-lg p-3 space-y-3">
        <p className="text-xs font-medium text-slate-600">阈值配置</p>
        <div className="grid grid-cols-2 gap-3">
          <ThresholdInput label="最大延迟" value={threshold.max} unit="分钟" onBlur={handleMaxBlur} />
          <div />
          <ThresholdInput label="目标合格率" value={threshold.target} unit="%" onBlur={handleTargetBlur} />
          <ThresholdInput label="告警阈值" value={threshold.warning} unit="%" onBlur={handleWarningBlur} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 rounded-lg p-3 space-y-3">
      <p className="text-xs font-medium text-slate-600">阈值配置</p>
      <div className="grid grid-cols-2 gap-3">
        <ThresholdInput label="目标合格率" value={threshold.target} unit="%" onBlur={handleTargetBlur} />
        <ThresholdInput label="告警阈值" value={threshold.warning} unit="%" onBlur={handleWarningBlur} />
      </div>
    </div>
  );
}

export default function Rules() {
  const rules = useDQCStore((s) => s.rules);
  const topics = useDQCStore((s) => s.topics);
  const ruleStats = useDQCStore((s) => s.ruleStats);
  const toggleRuleStatus = useDQCStore((s) => s.toggleRuleStatus);
  const updateRuleThresholdFull = useDQCStore((s) => s.updateRuleThresholdFull);
  const RULE_TYPE_LABELS = useDQCStore((s) => s.RULE_TYPE_LABELS);
  const getTopicById = useDQCStore((s) => s.getTopicById);

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [expandedGroups, setExpandedGroups] = useState<Set<RuleType>>(
    () => new Set(RULE_TYPE_ORDER)
  );

  const stats = ruleStats();

  const topicRuleCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const rule of rules) {
      counts.set(rule.topicId, (counts.get(rule.topicId) || 0) + 1);
    }
    return counts;
  }, [rules]);

  const filteredRules = useMemo(() => {
    return rules.filter((r) => {
      if (searchText && !r.name.toLowerCase().includes(searchText.toLowerCase())) return false;
      if (statusFilter === "enabled" && r.status !== RuleStatus.Enabled) return false;
      if (statusFilter === "disabled" && r.status !== RuleStatus.Disabled) return false;
      if (statusFilter === "pending" && r.status !== RuleStatus.Pending) return false;
      if (selectedTopic !== "all" && r.topicId !== selectedTopic) return false;
      return true;
    });
  }, [rules, searchText, statusFilter, selectedTopic]);

  const groupedRules = useMemo(() => {
    const groups = new Map<RuleType, typeof filteredRules>();
    for (const type of RULE_TYPE_ORDER) {
      groups.set(type, []);
    }
    for (const rule of filteredRules) {
      groups.get(rule.type)?.push(rule);
    }
    return groups;
  }, [filteredRules]);

  const toggleGroup = useCallback((type: RuleType) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  const handleUpdateThreshold = useCallback(
    (ruleId: string, thresholds: { min?: number; max?: number; target?: number; warning?: number }) => {
      updateRuleThresholdFull(ruleId, thresholds);
    },
    [updateRuleThresholdFull]
  );

  const statCards = [
    { label: "规则总数", value: stats.total, color: "text-navy-700" },
    { label: "启用规则", value: stats.enabled, color: "text-success-600" },
    { label: "停用规则", value: stats.disabled, color: "text-slate-600" },
    { label: "待审核规则", value: stats.pending, color: "text-gold-600" },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">规则管理</h1>
          <p className="text-sm text-slate-500 mt-1">
            管理数据质量校验规则，配置检查逻辑和阈值
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statCards.map((item, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-card border border-slate-100 p-5">
            <p className="text-sm text-slate-500 mb-2">{item.label}</p>
            <p className={`text-2xl font-bold tabular-nums ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-card border border-slate-100 p-5 space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜索规则名称..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="px-4 py-2.5 border border-slate-200 text-sm text-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 bg-white"
          >
            <option value="all">全部状态</option>
            <option value="enabled">启用</option>
            <option value="disabled">停用</option>
            <option value="pending">待审核</option>
          </select>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          <button
            onClick={() => setSelectedTopic("all")}
            className={cn(
              "shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
              selectedTopic === "all"
                ? "bg-navy-700 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            全部
            <span
              className={cn(
                "inline-flex items-center justify-center min-w-[20px] h-5 rounded-full text-[11px] font-semibold px-1.5",
                selectedTopic === "all"
                  ? "bg-white/20 text-white"
                  : "bg-white text-slate-600"
              )}
            >
              {rules.length}
            </span>
          </button>
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(topic.id)}
              className={cn(
                "shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
                selectedTopic === topic.id
                  ? "bg-navy-700 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {topic.name}
              <span
                className={cn(
                  "inline-flex items-center justify-center min-w-[20px] h-5 rounded-full text-[11px] font-semibold px-1.5",
                  selectedTopic === topic.id
                    ? "bg-white/20 text-white"
                    : "bg-white text-slate-600"
                )}
              >
                {topicRuleCounts.get(topic.id) || 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {RULE_TYPE_ORDER.map((type) => {
          const typeRules = groupedRules.get(type) ?? [];
          const isExpanded = expandedGroups.has(type);
          const colors = TYPE_COLOR_MAP[type];

          return (
            <div key={type} className="bg-white rounded-xl shadow-card border border-slate-100 overflow-hidden">
              <button
                onClick={() => toggleGroup(type)}
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-50/50 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
                <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", colors.badge)}>
                  {RULE_TYPE_LABELS[type]}
                </span>
                <span className="inline-flex items-center justify-center min-w-[24px] h-5 rounded-full bg-slate-100 text-xs font-semibold text-slate-600 px-1.5">
                  {typeRules.length}
                </span>
              </button>

              {isExpanded && (
                <div className="px-5 pb-4 space-y-3">
                  {typeRules.length === 0 ? (
                    <p className="text-sm text-slate-400 py-4 text-center">暂无规则</p>
                  ) : (
                    typeRules.map((rule) => {
                      const topic = getTopicById(rule.topicId);
                      return (
                        <div
                          key={rule.id}
                          className="flex rounded-lg border border-slate-100 overflow-hidden hover:shadow-sm transition-shadow bg-white"
                        >
                          <div className={cn("w-1 shrink-0", colors.bar)} />
                          <div className="flex-1 p-4 space-y-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-slate-800 truncate">{rule.name}</h4>
                                  <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium", STATUS_BADGE[rule.status])}>
                                    {STATUS_LABELS[rule.status]}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-500">{rule.description}</p>
                              </div>
                              <Switch
                                checked={rule.status === RuleStatus.Enabled}
                                onChange={() => toggleRuleStatus(rule.id)}
                              />
                            </div>

                            <RuleThresholdEditor
                              rule={rule}
                              onUpdate={(thresholds) => handleUpdateThreshold(rule.id, thresholds)}
                            />

                            <div className="flex items-center justify-between pt-1">
                              <div className="flex items-center gap-4 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  {rule.frequency}
                                </span>
                              </div>
                              {topic && (
                                <span className="text-xs text-slate-400">
                                  主题：{topic.name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
