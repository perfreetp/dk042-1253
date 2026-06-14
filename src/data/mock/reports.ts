import { QualityReport, QualityTrendPoint } from '../types';

/**
 * 生成过去30天的趋势数据
 */
const generateTrendData = (): QualityTrendPoint[] => {
  const data: QualityTrendPoint[] = [];
  const today = new Date('2026-06-15T00:00:00Z');

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    const baseScore = 82 + Math.sin(i / 3) * 5;
    const randomVariation = (Math.random() - 0.5) * 6;
    const score = Math.min(98, Math.max(72, Math.round(baseScore + randomVariation)));

    const baseAnomalies = 8 + Math.cos(i / 4) * 4;
    const anomalyCount = Math.max(1, Math.round(baseAnomalies + (Math.random() - 0.3) * 8));

    const baseExecutions = 45 + Math.sin(i / 5) * 10;
    const ruleExecutions = Math.round(baseExecutions + (Math.random() - 0.5) * 12);

    data.push({
      date: date.toISOString().slice(0, 10),
      score,
      anomalyCount,
      ruleExecutions,
    });
  }

  return data;
};

/**
 * 30天质量趋势数据
 */
export const qualityTrendData: QualityTrendPoint[] = generateTrendData();

/**
 * 月度质量报告模拟数据
 */
export const monthlyReports: QualityReport[] = [
  {
    id: 'report_202605',
    period: '月度',
    month: '2026-05',
    avgScore: 85.6,
    totalRules: 20,
    totalTasks: 1280,
    totalAnomalies: 328,
    totalTickets: 24,
    resolvedTickets: 18,
    topicScores: [
      { topicId: 't001', topicName: '客户主数据', score: 94 },
      { topicId: 't002', topicName: '订单交易数据', score: 90 },
      { topicId: 't003', topicName: '商品信息数据', score: 85 },
      { topicId: 't004', topicName: '财务核算数据', score: 93 },
      { topicId: 't005', topicName: '库存管理数据', score: 82 },
      { topicId: 't006', topicName: '用户行为数据', score: 79 },
      { topicId: 't007', topicName: '供应商数据', score: 74 },
      { topicId: 't008', topicName: '营销活动数据', score: 81 },
      { topicId: 't009', topicName: '物流配送数据', score: 70 },
      { topicId: 't010', topicName: '售后服务数据', score: 88 },
    ],
    generatedAt: '2026-06-01T00:00:00Z',
  },
  {
    id: 'report_202604',
    period: '月度',
    month: '2026-04',
    avgScore: 83.2,
    totalRules: 18,
    totalTasks: 1150,
    totalAnomalies: 385,
    totalTickets: 32,
    resolvedTickets: 26,
    topicScores: [
      { topicId: 't001', topicName: '客户主数据', score: 92 },
      { topicId: 't002', topicName: '订单交易数据', score: 88 },
      { topicId: 't003', topicName: '商品信息数据', score: 83 },
      { topicId: 't004', topicName: '财务核算数据', score: 91 },
      { topicId: 't005', topicName: '库存管理数据', score: 80 },
      { topicId: 't006', topicName: '用户行为数据', score: 77 },
      { topicId: 't007', topicName: '供应商数据', score: 72 },
      { topicId: 't008', topicName: '营销活动数据', score: 79 },
      { topicId: 't009', topicName: '物流配送数据', score: 68 },
      { topicId: 't010', topicName: '售后服务数据', score: 86 },
    ],
    generatedAt: '2026-05-01T00:00:00Z',
  },
  {
    id: 'report_202603',
    period: '月度',
    month: '2026-03',
    avgScore: 81.5,
    totalRules: 15,
    totalTasks: 960,
    totalAnomalies: 412,
    totalTickets: 28,
    resolvedTickets: 22,
    topicScores: [
      { topicId: 't001', topicName: '客户主数据', score: 90 },
      { topicId: 't002', topicName: '订单交易数据', score: 86 },
      { topicId: 't003', topicName: '商品信息数据', score: 81 },
      { topicId: 't004', topicName: '财务核算数据', score: 89 },
      { topicId: 't005', topicName: '库存管理数据', score: 78 },
      { topicId: 't006', topicName: '用户行为数据', score: 75 },
      { topicId: 't007', topicName: '供应商数据', score: 70 },
      { topicId: 't008', topicName: '营销活动数据', score: 77 },
      { topicId: 't009', topicName: '物流配送数据', score: 66 },
      { topicId: 't010', topicName: '售后服务数据', score: 83 },
    ],
    generatedAt: '2026-04-01T00:00:00Z',
  },
];

/**
 * 根据月份获取月度报告
 */
export const getReportByMonth = (month: string): QualityReport | undefined => {
  return monthlyReports.find((r) => r.month === month);
};

/**
 * 获取最新月度报告
 */
export const getLatestReport = (): QualityReport | undefined => {
  return monthlyReports[0];
};
