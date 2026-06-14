import { User } from '../types';

/**
 * 用户模拟数据 - 8个用户
 */
export const users: User[] = [
  {
    id: 'u001',
    name: '张明',
    email: 'zhangming@company.com',
    department: '数据治理部',
  },
  {
    id: 'u002',
    name: '李娜',
    email: 'lina@company.com',
    department: '数据治理部',
  },
  {
    id: 'u003',
    name: '王强',
    email: 'wangqiang@company.com',
    department: '技术研发部',
  },
  {
    id: 'u004',
    name: '刘芳',
    email: 'liufang@company.com',
    department: '业务运营部',
  },
  {
    id: 'u005',
    name: '陈伟',
    email: 'chenwei@company.com',
    department: '财务中心',
  },
  {
    id: 'u006',
    name: '赵丽',
    email: 'zhaoli@company.com',
    department: '客户服务部',
  },
  {
    id: 'u007',
    name: '孙浩',
    email: 'sunhao@company.com',
    department: '技术研发部',
  },
  {
    id: 'u008',
    name: '周敏',
    email: 'zhoumin@company.com',
    department: '产品管理部',
  },
];

/**
 * 根据用户ID获取用户信息
 */
export const getUserById = (id: string): User | undefined => {
  return users.find((u) => u.id === id);
};
