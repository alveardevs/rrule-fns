import {
  RRuleParser,
  generateRecurrenceDates,
  generateRecurrenceOccurrences,
  dateMatchesPattern,
  describeRRule,
  getUpcomingOccurrences,
  isValidRRule,
} from '../lib/recurrence.utils'; 

describe('RecurrenceUtils', () => {
  // Mock current date for consistent testing
  const mockCurrentDate = new Date('2025-06-14T10:00:00Z');

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockCurrentDate);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('generateRecurrenceDates', () => {
    it('should generate next 3 Wednesdays from today', () => {
      const result = generateRecurrenceDates(new Date(), 'FREQ=WEEKLY;BYDAY=WE', 3);
      expect(result).toEqual(['2025-06-18', '2025-06-25', '2025-07-02']);
    });

    it('should generate 5 daily dates from June 14', () => {
      const result = generateRecurrenceDates('2025-06-14', 'FREQ=DAILY', 5);
      expect(result).toEqual([
        '2025-06-14',
        '2025-06-15',
        '2025-06-16',
        '2025-06-17',
        '2025-06-18',
      ]);
    });

    it('should generate Monday and Friday dates for 4 weeks (8 occurrences)', () => {
      const result = generateRecurrenceDates('2025-06-16', 'FREQ=WEEKLY;BYDAY=MO,FR', 8);
      expect(result).toEqual([
        '2025-06-16', // Monday
        '2025-06-20', // Friday
        '2025-06-23', // Monday
        '2025-06-27', // Friday
        '2025-06-30', // Monday
        '2025-07-04', // Friday
        '2025-07-07', // Monday
        '2025-07-11', // Friday
      ]);
    });

    it('should generate first Friday of each month for 6 months', () => {
      const result = generateRecurrenceDates('2025-06-01', 'FREQ=MONTHLY;BYDAY=FR;BYSETPOS=1', 6);
      expect(result).toEqual([
        '2025-06-06', // First Friday of June
        '2025-07-04', // First Friday of July
        '2025-08-01', // First Friday of August
        '2025-09-05', // First Friday of September
        '2025-10-03', // First Friday of October
        '2025-11-07', // First Friday of November
      ]);
    });

    it('should generate 15th of each month until end of year', () => {
      const result = generateRecurrenceDates(
        '2025-06-15',
        'FREQ=MONTHLY;BYMONTHDAY=15',
        undefined,
        '2025-12-31',
      );
      expect(result).toEqual([
        '2025-06-15',
        '2025-07-15',
        '2025-08-15',
        '2025-09-15',
        '2025-10-15',
        '2025-11-15',
        '2025-12-15',
      ]);
    });

    it('should generate bi-weekly occurrences (every 2 weeks)', () => {
      const result = generateRecurrenceDates('2025-06-14', 'FREQ=WEEKLY;INTERVAL=2', 5);
      expect(result).toEqual([
        '2025-06-14',
        '2025-06-28',
        '2025-07-12',
        '2025-07-26',
        '2025-08-09',
      ]);
    });

    it('should handle last Friday of month', () => {
      const result = generateRecurrenceDates('2025-06-01', 'FREQ=MONTHLY;BYDAY=FR;BYSETPOS=-1', 3);
      expect(result).toEqual([
        '2025-06-27', // Last Friday of June
        '2025-07-25', // Last Friday of July
        '2025-08-29', // Last Friday of August
      ]);
    });

    it('should handle yearly recurrence', () => {
      const result = generateRecurrenceDates('2025-06-14', 'FREQ=YEARLY', 3);
      expect(result).toEqual(['2025-06-14', '2026-06-14', '2027-06-14']);
    });

    it('should respect COUNT parameter in RRULE', () => {
      const result = generateRecurrenceDates('2025-06-14', 'FREQ=DAILY;COUNT=3');
      expect(result).toHaveLength(3);
      expect(result).toEqual(['2025-06-14', '2025-06-15', '2025-06-16']);
    });

    it('should respect UNTIL parameter in RRULE', () => {
      const result = generateRecurrenceDates('2025-06-14', 'FREQ=DAILY;UNTIL=20250616T235959Z');
      expect(result).toEqual(['2025-06-14', '2025-06-15', '2025-06-16']);
    });
  });

  describe('generateRecurrenceOccurrences', () => {
    it('should return Date objects instead of strings', () => {
      const result = generateRecurrenceOccurrences('2025-06-14', 'FREQ=DAILY', 2);
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Date);
      expect(result[0].toISOString().split('T')[0]).toBe('2025-06-14');
    });
  });

  describe('dateMatchesPattern', () => {
    it('should return true for date that matches pattern', () => {
      const result = dateMatchesPattern('2025-06-18', '2025-06-14', 'FREQ=WEEKLY;BYDAY=WE');
      expect(result).toBe(true);
    });

    it('should return false for date that does not match pattern', () => {
      const result = dateMatchesPattern('2025-06-19', '2025-06-14', 'FREQ=WEEKLY;BYDAY=WE');
      expect(result).toBe(false);
    });

    it('should work with Date objects', () => {
      const result = dateMatchesPattern(
        new Date('2025-06-18'),
        new Date('2025-06-14'),
        'FREQ=WEEKLY;BYDAY=WE',
      );
      expect(result).toBe(true);
    });
  });

  describe('describeRRule', () => {
    it('should describe daily recurrence', () => {
      expect(describeRRule('FREQ=DAILY')).toBe('Daily');
      expect(describeRRule('FREQ=DAILY;INTERVAL=3')).toBe('Every 3 days');
    });

    it('should describe weekly recurrence', () => {
      expect(describeRRule('FREQ=WEEKLY')).toBe('Weekly');
      expect(describeRRule('FREQ=WEEKLY;BYDAY=WE')).toBe('Weekly on we');
      expect(describeRRule('FREQ=WEEKLY;BYDAY=MO,FR')).toBe('Weekly on mo, fr');
      expect(describeRRule('FREQ=WEEKLY;INTERVAL=2')).toBe('Every 2 weeks');
    });

    it('should describe monthly recurrence', () => {
      expect(describeRRule('FREQ=MONTHLY')).toBe('Monthly');
      expect(describeRRule('FREQ=MONTHLY;BYMONTHDAY=15')).toBe('Monthly on day 15');
      expect(describeRRule('FREQ=MONTHLY;BYDAY=FR;BYSETPOS=1')).toBe(
        'Monthly on the first fr',
      );
      expect(describeRRule('FREQ=MONTHLY;BYDAY=FR;BYSETPOS=-1')).toBe(
        'Monthly on the last fr',
      );
    });

    it('should describe yearly recurrence', () => {
      expect(describeRRule('FREQ=YEARLY')).toBe('Yearly');
      expect(describeRRule('FREQ=YEARLY;INTERVAL=2')).toBe('Every 2 years');
    });

    it('should include count and until information', () => {
      expect(describeRRule('FREQ=DAILY;COUNT=5')).toBe('Daily, 5 times');
      expect(describeRRule('FREQ=WEEKLY;UNTIL=20251231T235959Z')).toContain('until');
    });
  });

  describe('getUpcomingOccurrences', () => {
    it('should get upcoming occurrences from today', () => {
      const result = getUpcomingOccurrences('FREQ=DAILY', 3);
      expect(result).toHaveLength(3);
      expect(result[0]).toBeInstanceOf(Date);
      expect(result[0].toISOString().split('T')[0]).toBe('2025-06-14');
    });

    it('should default to 5 occurrences', () => {
      const result = getUpcomingOccurrences('FREQ=DAILY');
      expect(result).toHaveLength(5);
    });
  });

  describe('isValidRRule', () => {
    it('should validate correct RRULE strings', () => {
      expect(isValidRRule('FREQ=DAILY')).toBe(true);
      expect(isValidRRule('FREQ=WEEKLY;BYDAY=MO,FR')).toBe(true);
      expect(isValidRRule('FREQ=MONTHLY;BYMONTHDAY=15')).toBe(true);
    });

    it('should reject invalid RRULE strings', () => {
      expect(isValidRRule('INVALID')).toBe(false);
      expect(isValidRRule('FREQ=INVALID')).toBe(false);
      expect(isValidRRule('')).toBe(false);
    });
  });

  describe('RRuleParser.parseRRule', () => {
    it('should parse basic RRULE correctly', () => {
      const result = RRuleParser.stringToRRule('FREQ=WEEKLY;BYDAY=WE;INTERVAL=2');
      expect(result).toEqual({
        frequency: 'WEEKLY',
        interval: 2,
        byWeekDay: ['WE'],
      });
    });

    it('should handle all RRULE components', () => {
      const result = RRuleParser.stringToRRule(
        'FREQ=MONTHLY;INTERVAL=2;BYDAY=FR;BYSETPOS=1;COUNT=10;UNTIL=20251231T235959Z',
      );
      expect(result.frequency).toBe('MONTHLY');
      expect(result.interval).toBe(2);
      expect(result.byWeekDay).toEqual(['FR']);
      expect(result.bySetPos).toBe(1);
      expect(result.count).toBe(10);
      expect(result.until).toBeInstanceOf(Date);
    });

    it('should set default interval to 1', () => {
      const result = RRuleParser.stringToRRule('FREQ=DAILY');
      expect(result.interval).toBe(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle February 29th in non-leap years', () => {
      const result = generateRecurrenceDates('2024-02-29', 'FREQ=YEARLY', 2);
      expect(result).toEqual([
        '2024-02-29',
        '2025-02-28', // Adjusted to Feb 28 in non-leap year
      ]);
    });

    it('should handle invalid month days gracefully', () => {
      // Requesting 31st of February should adjust to last day of month
      const result = generateRecurrenceDates('2025-01-31', 'FREQ=MONTHLY;BYMONTHDAY=31', 3);
      expect(result).toEqual([
        '2025-01-31',
        '2025-02-28', // February doesn't have 31 days
        '2025-03-31',
      ]);
    });

    it('should handle empty results gracefully', () => {
      const result = generateRecurrenceDates('2025-06-14', 'FREQ=DAILY;COUNT=0');
      expect(result).toEqual([]);
    });

    it('should limit results to prevent infinite loops', () => {
      const result = generateRecurrenceDates('2025-06-14', 'FREQ=DAILY'); // No count specified
      expect(result.length).toBeLessThanOrEqual(100); // Should have default limit
    });
  });

  describe('Real-world Hostel Activity Examples', () => {
    it('should handle Pizza Party every Wednesday', () => {
      const pizzaParty = generateRecurrenceDates('2025-06-14', 'FREQ=WEEKLY;BYDAY=WE', 4);
      expect(pizzaParty).toEqual([
        '2025-06-18', // Next Wednesday
        '2025-06-25',
        '2025-07-02',
        '2025-07-09',
      ]);
    });

    it('should handle Walking Tour every Monday, Wednesday, Friday', () => {
      const walkingTour = generateRecurrenceDates('2025-06-16', 'FREQ=WEEKLY;BYDAY=MO,WE,FR', 6);
      expect(walkingTour).toEqual([
        '2025-06-16', // Monday
        '2025-06-18', // Wednesday
        '2025-06-20', // Friday
        '2025-06-23', // Monday
        '2025-06-25', // Wednesday
        '2025-06-27', // Friday
      ]);
    });

    it('should handle Monthly Asado first Saturday of month', () => {
      const asado = generateRecurrenceDates('2025-06-01', 'FREQ=MONTHLY;BYDAY=SA;BYSETPOS=1', 3);
      expect(asado).toEqual([
        '2025-06-07', // First Saturday of June
        '2025-07-05', // First Saturday of July
        '2025-08-02', // First Saturday of August
      ]);
    });
  });
});
