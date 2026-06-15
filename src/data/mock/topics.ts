import { BusinessTopic, QualityLevel } from '../types';

/**
 * 根据质量分数获取质量等级
 */
const getLevelByScore = (score: number): QualityLevel => {
  if (score >= 90) return QualityLevel.Excellent;
  if (score >= 80) return QualityLevel.Good;
  if (score >= 70) return QualityLevel.Pass;
  return QualityLevel.Fail;
};

/**
 * 业务主题模拟数据 - 10个业务主题
 */
export const topics: BusinessTopic[] = [
  {
    id: 't001',
    name: '客户主数据',
    description: '客户基础信息管理，包括客户基本资料、联系方式等核心数据',
    system: 'CRM系统',
    department: '客户服务部',
    score: 96,
    level: QualityLevel.Excellent,
    ruleCount: 15,
    issueCount: 2,
    ownerId: 'u001',
    createdAt: '2026-01-10T09:00:00Z',
  },
  {
    id: 't002',
    name: '订单交易数据',
    description: '订单全生命周期数据，包括下单、支付、发货、签收等环节',
    system: '交易系统',
    department: '业务运营部',
    score: 92,
    level: QualityLevel.Excellent,
    ruleCount: 22,
    issueCount: 5,
    ownerId: 'u003',
    createdAt: '2026-01-12T10:30:00Z',
  },
  {
    id: 't003',
    name: '商品信息数据',
    description: '商品SKU、库存、价格等商品基础信息管理',
    system: '商品管理系统',
    department: '产品管理部',
    score: 88,
    level: QualityLevel.Good,
    ruleCount: 18,
    issueCount: 8,
    ownerId: 'u008',
    createdAt: '2026-01-15T14:20:00Z',
  },
  {
    id: 't004',
    name: '财务核算数据',
    description: '财务记账、凭证、报表等财务核心数据资产',
    system: '财务系统',
    department: '财务中心',
    score: 94,
    level: QualityLevel.Excellent,
    ruleCount: 25,
    issueCount: 3,
    ownerId: 'u005',
    createdAt: '2026-01-18T08:45:00Z',
  },
  {
    id: 't005',
    name: '库存管理数据',
    description: '仓库、库存、出入库流水等库存相关数据',
    system: '仓储系统',
    department: '供应链部',
    score: 85,
    level: QualityLevel.Good,
    ruleCount: 12,
    issueCount: 10,
    ownerId: 'u004',
    createdAt: '2026-01-20T11:00:00Z',
  },
  {
    id: 't006',
    name: '用户行为数据',
    description: '用户在平台上的浏览、点击、转化等行为日志',
    system: '行为采集平台',
    department: '数据治理部',
    score: 81,
    level: QualityLevel.Good,
    ruleCount: 8,
    issueCount: 12,
    ownerId: 'u002',
    createdAt: '2026-01-22T16:30:00Z',
  },
  {
    id: 't007',
    name: '供应商数据',
    description: '供应商基础信息、合同、评价等管理数据',
    system: '采购系统',
    department: '供应链部',
    score: 76,
    level: QualityLevel.Pass,
    ruleCount: 10,
    issueCount: 15,
    ownerId: 'u007',
    createdAt: '2026-02-01T09:15:00Z',
  },
  {
    id: 't008',
    name: '营销活动数据',
    description: '营销活动配置、投放、效果分析数据',
    system: '营销平台',
    department: '市场部',
    score: 83,
    level: QualityLevel.Good,
    ruleCount: 14,
    issueCount: 7,
    ownerId: 'u006',
    createdAt: '2026-02-05T13:40:00Z',
  },
  {
    id: 't009',
    name: '物流配送数据',
    description: '物流运单、配送轨迹、签收数据',
    system: '物流管理系统',
    department: '供应链部',
    score: 72,
    level: QualityLevel.Pass,
    ruleCount: 9,
    issueCount: 18,
    ownerId: 'u004',
    createdAt: '2026-02-08T10:10:00Z',
  },
  {
    id: 't010',
    name: '售后服务数据',
    description: '售后工单、退换货、客户投诉处理数据',
    system: '客服系统',
    department: '客户服务部',
    score: 89,
    level: QualityLevel.Good,
    ruleCount: 11,
    issueCount: 6,
    ownerId: 'u006',
    createdAt: '2026-02-10T15:25:00Z',
  },
];

/**
 * 根据主题ID获取业务主题
 */
export const getTopicById = (id: string): BusinessTopic | undefined => {
  return topics.find((t) => t.id === id);
};
