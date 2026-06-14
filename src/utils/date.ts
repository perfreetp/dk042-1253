/**
 * 获取今天的日期 (YYYY-MM-DD)
 */
export const getToday = (): string => {
  const now = new Date();
  return formatDate(now);
};

/**
 * 格式化日期为 YYYY-MM-DD
 */
export const formatDate = (date: Date): string => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

/**
 * 格式化日期为 YYYY-MM-DD HH:mm:ss
 */
export const formatDateTime = (date: Date): string => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${formatDate(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

/**
 * 获取过去N天的日期数组 (YYYY-MM-DD)
 */
export const getLastNDays = (n: number): string[] => {
  const days: string[] = [];
  const now = new Date();

  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    days.push(formatDate(date));
  }

  return days;
};

/**
 * 获取过去N个月的月份数组 (YYYY-MM)
 */
export const getLastNMonths = (n: number): string[] => {
  const months: string[] = [];
  const now = new Date();

  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(now.getMonth() - i);
    const pad = (num: number) => num.toString().padStart(2, '0');
    months.push(`${date.getFullYear()}-${pad(date.getMonth() + 1)}`);
  }

  return months;
};

/**
 * 计算两个日期之间的天数差
 */
export const getDaysDiff = (date1: string, date2: string): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * 检查日期是否在今天之前
 */
export const isBeforeToday = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date.getTime() < today.getTime();
};

/**
 * 检查日期是否即将过期 (在指定天数内)
 */
export const isExpiringSoon = (dateString: string, days: number = 3): boolean => {
  const date = new Date(dateString);
  const now = new Date();
  const threshold = new Date(now);
  threshold.setDate(now.getDate() + days);

  return date.getTime() <= threshold.getTime() && date.getTime() >= now.getTime();
};

/**
 * 获取当月第一天
 */
export const getFirstDayOfMonth = (): string => {
  const now = new Date();
  return formatDate(new Date(now.getFullYear(), now.getMonth(), 1));
};

/**
 * 获取当月最后一天
 */
export const getLastDayOfMonth = (): string => {
  const now = new Date();
  return formatDate(new Date(now.getFullYear(), now.getMonth() + 1, 0));
};

/**
 * 获取日期所属月份 (YYYY-MM格式)
 */
export const getMonthOfDate = (dateString: string): string => {
  const date = new Date(dateString);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
};

/**
 * 增加指定天数
 */
export const addDays = (dateString: string, days: number): string => {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return formatDate(date);
};

/**
 * 增加指定小时
 */
export const addHours = (dateString: string, hours: number): Date => {
  const date = new Date(dateString);
  date.setHours(date.getHours() + hours);
  return date;
};
