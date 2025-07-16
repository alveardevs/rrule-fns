// =================== CORE TYPES ===================

import { RRule, RRuleFrequency, WeekDay } from "./recurrence.type";

// =================== CORE PARSER ===================

interface RRuleDescribeOptions {
  lang?: 'en' | 'es';
}

interface Translations {
  [key: string]: {
    en: string;
    es: string;
  };
}

export class RRuleParser {
  private static WEEKDAY_MAP: Record<WeekDay, number> = {
    [WeekDay.SU]: 0,
    [WeekDay.MO]: 1,
    [WeekDay.TU]: 2,
    [WeekDay.WE]: 3,
    [WeekDay.TH]: 4,
    [WeekDay.FR]: 5,
    [WeekDay.SA]: 6,
  };

  static stringToRRule(rrule: string): RRule {
    const parts = rrule.split(';');
    const pattern: RRule = {
      frequency: RRuleFrequency.DAILY,
      interval: 1
    };

    parts.forEach((part) => {
      const [key, value] = part.split('=');
      switch (key) {
        case 'FREQ':
          pattern.frequency = value as RRuleFrequency;
          break;
        case 'INTERVAL':
          pattern.interval = parseInt(value);
          break;
        case 'BYDAY':
          pattern.byWeekDay = value.split(',') as WeekDay[];
          break;
        case 'BYMONTHDAY':
          pattern.byMonthDay = parseInt(value);
          break;
        case 'BYSETPOS':
          pattern.bySetPos = parseInt(value);
          break;
        case 'COUNT':
          pattern.count = parseInt(value);
          break;
        case 'UNTIL':
          // Convert back to ISO format
          pattern.until = new Date(value.replace(
            /(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/,
            '$1-$2-$3T$4:$5:$6Z',
          ));
          break;
      }
    });

    return pattern;
  }

  static toString(pattern: RRule): string {
    let rrule = `FREQ=${pattern.frequency}`;

    if (pattern.interval && pattern.interval > 1) {
      rrule += `;INTERVAL=${pattern.interval}`;
    }

    if (pattern.byWeekDay?.length) {
      rrule += `;BYDAY=${pattern.byWeekDay.join(',')}`;
    }

    if (pattern.byMonthDay) {
      rrule += `;BYMONTHDAY=${pattern.byMonthDay}`;
    }

    if (pattern.bySetPos) {
      rrule += `;BYSETPOS=${pattern.bySetPos}`;
    }

    if (pattern.count) {
      rrule += `;COUNT=${pattern.count}`;
    }

    if (pattern.until) {
      const until = pattern.until.toISOString().replace(/[-:]/g, '').replace('.000Z', 'Z');
      rrule += `;UNTIL=${until}`;
    }

    return rrule;
  }

  static describe(pattern: RRule, options: RRuleDescribeOptions = {}): string {
    const { lang = 'es' } = options;
    const { frequency, interval = 1, byWeekDay, byMonthDay, count, until, bySetPos } = pattern;
    
    const translations: Translations = {
      // Days of the week (full names)
      monday: { en: 'Monday', es: 'lunes' },
      tuesday: { en: 'Tuesday', es: 'martes' },
      wednesday: { en: 'Wednesday', es: 'miércoles' },
      thursday: { en: 'Thursday', es: 'jueves' },
      friday: { en: 'Friday', es: 'viernes' },
      saturday: { en: 'Saturday', es: 'sábado' },
      sunday: { en: 'Sunday', es: 'domingo' },
      
      // Days of the week (abbreviated)
      mo: { en: 'Monday', es: 'lunes' },
      tu: { en: 'Tuesday', es: 'martes' },
      we: { en: 'Wednesday', es: 'miércoles' },
      th: { en: 'Thursday', es: 'jueves' },
      fr: { en: 'Friday', es: 'viernes' },
      sa: { en: 'Saturday', es: 'sábado' },
      su: { en: 'Sunday', es: 'domingo' },
      
      // Frequency terms
      daily: { en: 'Daily', es: 'Diariamente' },
      weekly: { en: 'Weekly', es: 'Semanalmente' },
      monthly: { en: 'Monthly', es: 'Mensualmente' },
      yearly: { en: 'Yearly', es: 'Anualmente' },
      
      // Common phrases
      every: { en: 'Every', es: 'Cada' },
      days: { en: 'days', es: 'días' },
      weeks: { en: 'weeks', es: 'semanas' },
      months: { en: 'months', es: 'meses' },
      years: { en: 'years', es: 'años' },
      on: { en: 'on', es: 'los' },
      and: { en: 'and', es: 'y' },
      weekend: { en: 'weekend', es: 'fin de semana' },
      weekday: { en: 'weekday', es: 'día laboral' },
      
      // Ordinals
      first: { en: 'first', es: 'primer' },
      second: { en: 'second', es: 'segundo' },
      third: { en: 'third', es: 'tercer' },
      fourth: { en: 'fourth', es: 'cuarto' },
      last: { en: 'last', es: 'último' },
      
      // Time expressions
      times: { en: 'times', es: 'veces' },
      until: { en: 'until', es: 'hasta' },
      day: { en: 'day', es: 'día' },
      of: { en: 'of', es: 'de' },
      the: { en: 'the', es: 'el' },
      month: { en: 'month', es: 'mes' },
    };

    const t = (key: string): string => translations[key]?.[lang] || key;
    
    // Helper function to format day names
    const formatDayName = (day: string): string => {
      // Handle both full names and abbreviations
      const dayKey = day.toLowerCase();
      return t(dayKey);
    };

    // Helper function to format day list
    const formatDayList = (days: string[]): string => {
      if (days.length === 1) return formatDayName(days[0]);
      if (days.length === 2) return `${formatDayName(days[0])} ${t('and')} ${formatDayName(days[1])}`;
      
      const lastDay = formatDayName(days[days.length - 1]);
      const otherDays = days.slice(0, -1).map(formatDayName).join(', ');
      return `${otherDays} ${t('and')} ${lastDay}`;
    };

    // Helper function to check if days represent weekend
    const isWeekend = (days: string[]): boolean => {
      const weekendDays = ['saturday', 'sunday', 'sa', 'su'];
      return days.length === 2 && 
            days.every(day => weekendDays.includes(day.toLowerCase()));
    };

    // Helper function to check if days represent weekdays
    const isWeekdays = (days: string[]): boolean => {
      const weekdaysList = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'mo', 'tu', 'we', 'th', 'fr'];
      return days.length === 5 && 
            days.every(day => weekdaysList.includes(day.toLowerCase()));
    };

    // Helper function to get ordinal position
    const getOrdinalPosition = (pos: number): string => {
      switch (pos) {
        case -1: return t('last');
        case 1: return t('first');
        case 2: return t('second');
        case 3: return t('third');
        case 4: return t('fourth');
        default: return `${pos}${lang === 'en' ? 'th' : 'º'}`;
      }
    };

    // Helper function to format month day with ordinal
    const formatMonthDay = (day: number): string => {
      if (lang === 'en') {
        const suffix = day === 1 || day === 21 || day === 31 ? 'st' :
                      day === 2 || day === 22 ? 'nd' :
                      day === 3 || day === 23 ? 'rd' : 'th';
        return `${day}${suffix}`;
      } else {
        return `${day}`;
      }
    };

    let description = '';

    switch (frequency) {
      case RRuleFrequency.DAILY:
        if (interval === 1) {
          description = t('daily');
        } else {
          description = lang === 'en' ? 
            `${t('every')} ${interval} ${t('days')}` :
            `${t('every')} ${interval} ${t('days')}`;
        }
        break;

      case RRuleFrequency.WEEKLY:
        if (byWeekDay?.length) {
          // Check for special cases
          if (isWeekend(byWeekDay)) {
            description = interval === 1 ? 
              `${t('every')} ${t('weekend')}` :
              `${t('every')} ${interval} ${t('weeks')} ${t('on')} ${t('weekend')}`;
          } else if (isWeekdays(byWeekDay)) {
            description = interval === 1 ? 
              `${t('every')} ${t('weekday')}` :
              `${t('every')} ${interval} ${t('weeks')} ${t('on')} ${t('weekday')}`;
          } else {
            const dayList = formatDayList(byWeekDay);
            if (interval === 1) {
              description = lang === 'en' ? 
                `${t('every')} ${dayList}` :
                `${t('every')} ${dayList}`;
            } else {
              description = lang === 'en' ? 
                `${t('every')} ${interval} ${t('weeks')} ${t('on')} ${dayList}` :
                `${t('every')} ${interval} ${t('weeks')} ${t('on')} ${dayList}`;
            }
          }
        } else {
          description = interval === 1 ? 
            t('weekly') : 
            `${t('every')} ${interval} ${t('weeks')}`;
        }
        break;

      case RRuleFrequency.MONTHLY:
        if (byWeekDay?.length && bySetPos) {
          const pos = getOrdinalPosition(bySetPos);
          const dayName = formatDayName(byWeekDay[0]);
          
          if (interval === 1) {
            description = lang === 'en' ? 
              `${t('every')} ${pos} ${dayName} ${t('of')} ${t('the')} ${t('month')}` :
              `${t('every')} ${pos} ${dayName} ${t('of')} ${t('month')}`;
          } else {
            description = lang === 'en' ? 
              `${t('every')} ${interval} ${t('months')} ${t('on')} ${t('the')} ${pos} ${dayName}` :
              `${t('every')} ${interval} ${t('months')} ${t('on')} ${pos} ${dayName}`;
          }
        } else if (byMonthDay) {
          const dayFormatted = formatMonthDay(byMonthDay);
          
          if (interval === 1) {
            description = lang === 'en' ? 
              `${t('every')} ${dayFormatted} ${t('of')} ${t('the')} ${t('month')}` :
              `${t('every')} ${t('day')} ${dayFormatted} ${t('of')} ${t('month')}`;
          } else {
            description = lang === 'en' ? 
              `${t('every')} ${interval} ${t('months')} ${t('on')} ${t('the')} ${dayFormatted}` :
              `${t('every')} ${interval} ${t('months')} ${t('on')} ${t('day')} ${dayFormatted}`;
          }
        } else {
          description = interval === 1 ? 
            t('monthly') : 
            `${t('every')} ${interval} ${t('months')}`;
        }
        break;

      case RRuleFrequency.YEARLY:
        description = interval === 1 ? 
          t('yearly') : 
          `${t('every')} ${interval} ${t('years')}`;
        break;
    }

    // Add count or until clause
    if (count) {
      description += lang === 'en' ? 
        `, ${count} ${t('times')}` : 
        `, ${count} ${t('times')}`;
    } else if (until) {
      const untilDate = new Date(until);
      const monthNames = lang === 'en' ? 
        ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'] :
        ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
      
      const monthName = monthNames[untilDate.getMonth()];
      const year = untilDate.getFullYear();
      
      description += ` ${t('until')} ${monthName}, ${year}`;
    }

    return description;
  }

  private static getWeekdayNumber(weekday: WeekDay): number {
    return this.WEEKDAY_MAP[weekday];
  }

  private static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  private static addWeeks(date: Date, weeks: number): Date {
    return this.addDays(date, weeks * 7);
  }

  private static addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  private static addYears(date: Date, years: number): Date {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
  }

  private static getNthWeekdayOfMonth(
    year: number,
    month: number,
    weekday: WeekDay,
    nth: number,
  ): Date | null {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const targetWeekday = this.getWeekdayNumber(weekday);

    if (nth > 0) {
      // Find nth occurrence from start
      let count = 0;
      for (let day = 1; day <= lastDay.getDate(); day++) {
        const current = new Date(year, month, day);
        if (current.getDay() === targetWeekday) {
          count++;
          if (count === nth) return current;
        }
      }
    } else {
      // Find nth occurrence from end (nth is negative)
      const occurrences: Date[] = [];
      for (let day = 1; day <= lastDay.getDate(); day++) {
        const current = new Date(year, month, day);
        if (current.getDay() === targetWeekday) {
          occurrences.push(current);
        }
      }
      const index = occurrences.length + nth; // nth is negative
      return index >= 0 ? occurrences[index] : null;
    }

    return null;
  }

  // =================== MAIN GENERATOR FUNCTION ===================

  static generateOccurrences(
    startDate: Date,
    rrule: string,
    maxCount?: number,
    endDate?: Date,
  ): Date[] {
    const parsed = this.stringToRRule(rrule);
    if (!parsed.interval) parsed.interval = 1;
    const occurrences: Date[] = [];
    let current = new Date(startDate);
    let count = 0;
    let isFirst = true;
    let eof = false;

    // Determine actual limit
    const limit = Math.min(
      maxCount || parsed.count || 100, // Default max 100 to prevent infinite loops
      parsed.count || Infinity,
    );

    // Determine actual end date
    const actualEndDate =
      endDate && parsed.until
        ? new Date(Math.min(endDate.getTime(), parsed.until.getTime()))
        : endDate || parsed.until;

    while (count < limit && (!actualEndDate || current <= actualEndDate)) {
      let nextOccurrence: Date | null = null;

      switch (parsed.frequency) {
        case RRuleFrequency.DAILY:
          nextOccurrence = count === 0 ? new Date(current) : this.addDays(current, parsed.interval);
          if (actualEndDate && nextOccurrence > actualEndDate) eof = true;
          break;

        case RRuleFrequency.WEEKLY:
          if (parsed.byWeekDay?.length) {
            // Se repite varios días a la semana
            nextOccurrence = this.getNextWeeklyOccurrence(
              current,
              parsed.byWeekDay,
              parsed.interval,
              count == 0,
            );
          } else {
            // Se repite un solo día de la semana
            nextOccurrence =
              count === 0 ? new Date(current) : this.addWeeks(current, parsed.interval);
          }
          break;

        case RRuleFrequency.MONTHLY:
          if (parsed.byWeekDay?.length && parsed.bySetPos) {
            // e.g., "First Friday of every month"
            nextOccurrence = this.getNextMonthlyWeekdayOccurrence(
              current,
              parsed.byWeekDay[0],
              parsed.bySetPos,
              parsed.interval,
              count === 0,
            );
          } else if (parsed.byMonthDay) {
            // e.g., "15th of every month"
            nextOccurrence = this.getNextMonthlyDayOccurrence(
              current,
              parsed.byMonthDay,
              parsed.interval,
              count === 0,
            );
          } else {
            // Same day of month as start date
            nextOccurrence =
              count === 0 ? new Date(current) : this.addMonths(current, parsed.interval);
          }
          if (actualEndDate && nextOccurrence && (nextOccurrence > actualEndDate)) eof = true; // PATCH para arreglar el UNTIL del monthly (Puede que funcione para todos los casos)
          break;

        case RRuleFrequency.YEARLY:
          nextOccurrence =
            count === 0 ? new Date(current) : this.addYears(current, parsed.interval);
          break;
      }

      if (!nextOccurrence) break;

      // Skip if before start date (can happen with complex patterns)
      if (nextOccurrence < startDate) {
        current = nextOccurrence;
        continue;
      }

      if (!eof) occurrences.push(new Date(nextOccurrence));
      current = nextOccurrence;
      if (count == 0) isFirst = false;
      count++;
    }

    return occurrences;
  }

  private static getNextWeeklyOccurrence(
    current: Date,
    weekdays: WeekDay[],
    interval: number,
    isFirst: boolean,
  ): Date | null {
    if (isFirst) {
      const currentWeekday = current.getDay();
      const sortedWeekdays = weekdays // e.g. [ 1, 5 ] // (lunes y viernes)
        .map((wd) => this.getWeekdayNumber(wd))
        .sort((a, b) => a - b);

      for (const targetWeekday of sortedWeekdays) {
        const daysToAdd = (targetWeekday - currentWeekday + 7) % 7;

        return this.addDays(current, daysToAdd);
      }

      // All matched today — go to next interval
      const nextWeek = this.addWeeks(current, interval);
      const daysToFirstWeekday = (sortedWeekdays[0] - nextWeek.getDay() + 7) % 7;
      return this.addDays(nextWeek, daysToFirstWeekday);
    }

    // Find next occurrence
    const sortedWeekdays = weekdays.map((wd) => this.getWeekdayNumber(wd)).sort((a, b) => a - b);

    const currentWeekday = current.getDay();
    let daysToAdd: number = 0;

    // Try to find next weekday in current week
    for (const targetWeekday of sortedWeekdays) {
      daysToAdd = targetWeekday - currentWeekday;
      if (targetWeekday > currentWeekday || (isFirst && targetWeekday >= currentWeekday)) {
        daysToAdd = targetWeekday - currentWeekday;
        return this.addDays(current, daysToAdd);
      }
    }

    // Cómo me costó arreglar esto che
    const weeksToAdd = interval - (isFirst ? 0 : weekdays.length == 1 && daysToAdd == 0 ? 0 : 1);

    const nextWeek = this.addWeeks(current, weeksToAdd);
    const daysToFirstWeekday = sortedWeekdays[0] - nextWeek.getDay();
    return this.addDays(
      nextWeek,
      daysToFirstWeekday >= 0 ? daysToFirstWeekday : daysToFirstWeekday + 7,
    );
  }

  private static getNextMonthlyWeekdayOccurrence(
    current: Date,
    weekday: WeekDay,
    setPos: number,
    interval: number,
    isFirst: boolean,
  ): Date | null {
    let targetMonth = isFirst ? current.getMonth() : current.getMonth() + interval;
    let targetYear = current.getFullYear();

    // Handle year overflow
    while (targetMonth >= 12) {
      targetMonth -= 12;
      targetYear++;
    }

    return this.getNthWeekdayOfMonth(targetYear, targetMonth, weekday, setPos);
  }

  private static getNextMonthlyDayOccurrence(
    current: Date,
    monthDay: number,
    interval: number,
    isFirst: boolean,
  ): Date | null {
    if (isFirst && current.getDate() === monthDay) {
      return new Date(current);
    }

    const targetDate = isFirst ? new Date(current) : this.addMonths(current, interval);
    targetDate.setDate(monthDay);

    // Handle invalid dates (e.g., Feb 31 -> Feb 28/29)
    if (targetDate.getDate() !== monthDay) {
      targetDate.setDate(0); // Last day of previous month
    }

    return targetDate;
  }
}

// =================== CONVENIENCE FUNCTIONS ===================

/**
 * Generate occurrence dates from a recurrence pattern
 * @param fromDate Starting date
 * @param rrule RFC 5545 recurrence rule string
 * @param count Optional maximum number of occurrences
 * @param toDate Optional end date
 * @returns Array of Date objects
 */
export function generateRecurrenceOccurrences(
  fromDate: Date | string,
  rrule: string,
  count?: number,
  toDate?: Date | string,
): Date[] {
  const startDate = typeof fromDate === 'string' ? new Date(fromDate) : fromDate;
  const endDate = typeof toDate === 'string' ? new Date(toDate) : toDate;

  return RRuleParser.generateOccurrences(startDate, rrule, count, endDate);
}

/**
 * Generate occurrence dates as ISO strings
 * @param fromDate Starting date
 * @param rrule RFC 5545 recurrence rule string
 * @param count Optional maximum number of occurrences
 * @param toDate Optional end date
 * @returns Array of ISO date strings (YYYY-MM-DD format)
 */
export function generateRecurrenceDates(
  fromDate: Date | string,
  rrule: string,
  count?: number,
  toDate?: Date | string,
): string[] {
  return generateRecurrenceOccurrences(fromDate, rrule, count, toDate).map(
    (date) => date.toISOString().split('T')[0],
  );
}

/**
 * Get the next N occurrences from today
 */
export function getUpcomingOccurrences(
  rrule: string,
  count: number = 5,
  startDate: Date = new Date(),
): Date[] {
  return generateRecurrenceOccurrences(startDate, rrule, count);
}

/**
 * Check if a date matches a recurrence pattern
 */
export function dateMatchesPattern(
  date: Date | string,
  startDate: Date | string,
  rrule: string,
): boolean {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const occurrences = generateRecurrenceOccurrences(startDate, rrule, 100);

  return occurrences.some((occurrence) => occurrence.toDateString() === targetDate.toDateString());
}

/**
 * Get human-readable description of recurrence pattern
 */
export function describeRRule(rrule: string): string {
  const parsed = RRuleParser.stringToRRule(rrule);
  return RRuleParser.describe(parsed);
}

/**
 * Validate RRULE string
 */
export function isValidRRule(rrule: string): boolean {
  try {
    RRuleParser.stringToRRule(rrule);
    return true;
  } catch {
    return false;
  }
}