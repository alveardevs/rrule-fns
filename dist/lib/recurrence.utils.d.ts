import { RRule } from "./recurrence.type";
interface RRuleDescribeOptions {
    lang?: 'en' | 'es';
}
export declare class RRuleParser {
    private static WEEKDAY_MAP;
    static stringToRRule(rrule: string): RRule;
    static toString(pattern: RRule): string;
    static describe(pattern: RRule, options?: RRuleDescribeOptions): string;
    private static getWeekdayNumber;
    private static addDays;
    private static addWeeks;
    private static addMonths;
    private static addYears;
    private static getNthWeekdayOfMonth;
    static generateOccurrences(startDate: Date, rrule: string, maxCount?: number, endDate?: Date): Date[];
    private static getNextWeeklyOccurrence;
    private static getNextMonthlyWeekdayOccurrence;
    private static getNextMonthlyDayOccurrence;
}
/**
 * Generate occurrence dates from a recurrence pattern
 * @param fromDate Starting date
 * @param rrule RFC 5545 recurrence rule string
 * @param count Optional maximum number of occurrences
 * @param toDate Optional end date
 * @returns Array of Date objects
 */
export declare function generateRecurrenceOccurrences(fromDate: Date | string, rrule: string, count?: number, toDate?: Date | string): Date[];
/**
 * Generate occurrence dates as ISO strings
 * @param fromDate Starting date
 * @param rrule RFC 5545 recurrence rule string
 * @param count Optional maximum number of occurrences
 * @param toDate Optional end date
 * @returns Array of ISO date strings (YYYY-MM-DD format)
 */
export declare function generateRecurrenceDates(fromDate: Date | string, rrule: string, count?: number, toDate?: Date | string): string[];
/**
 * Get the next N occurrences from today
 */
export declare function getUpcomingOccurrences(rrule: string, count?: number, startDate?: Date): Date[];
/**
 * Check if a date matches a recurrence pattern
 */
export declare function dateMatchesPattern(date: Date | string, startDate: Date | string, rrule: string): boolean;
/**
 * Get human-readable description of recurrence pattern
 */
export declare function describeRRule(rrule: string): string;
/**
 * Validate RRULE string
 */
export declare function isValidRRule(rrule: string): boolean;
export {};
