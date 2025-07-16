declare module '@byalvear/rrule-fns' {
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
    byWeekDay?: WeekDay[];
    byMonthDay?: number;
    bySetPos?: number;
    interval?: number;
    count?: number;
    until?: Date;
  }

  export interface RRuleDescribeOptions {
    lang?: 'en' | 'es';
  }

  export class RRuleParser {
    static stringToRRule(rrule: string): RRule;
    static toString(pattern: RRule): string;
    static describe(pattern: RRule, options?: RRuleDescribeOptions): string;
    static generateOccurrences(
      startDate: Date,
      rrule: string,
      maxCount?: number,
      endDate?: Date,
    ): Date[];
  }

  export function generateRecurrenceOccurrences(
    fromDate: Date | string,
    rrule: string,
    count?: number,
    toDate?: Date | string,
  ): Date[];

  export function generateRecurrenceDates(
    fromDate: Date | string,
    rrule: string,
    count?: number,
    toDate?: Date | string,
  ): string[];

  export function getUpcomingOccurrences(
    rrule: string,
    count?: number,
    startDate?: Date,
  ): Date[];

  export function dateMatchesPattern(
    date: Date | string,
    startDate: Date | string,
    rrule: string,
  ): boolean;

  export function describeRRule(rrule: string): string;

  export function isValidRRule(rrule: string): boolean;
}
