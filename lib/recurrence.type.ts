// =================== TYPES & VALIDATION ===================

export enum RRuleFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export enum WeekDay {
  MO = 'MO',
  TU = 'TU',
  WE = 'WE',
  TH = 'TH',
  FR = 'FR',
  SA = 'SA',
  SU = 'SU',
}

export interface RRule {
  frequency: RRuleFrequency;
  byWeekDay?: WeekDay[];  // For WEEKLY: which days
  byMonthDay?: number;    // For MONTHLY: day of month (1-31)
  bySetPos?: number;      // For MONTHLY: first/second/last occurrence (-1 = last)
  interval?: number;      // Every X days/weeks/months (default: 1)
  count?: number;         // Number of occurrences
  until?: Date;           // End date (ISO format)
}