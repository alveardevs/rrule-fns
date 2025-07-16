// =================== VALIDATION DECORATOR ===================

import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

import {
  RRuleFrequency,
  RRule,
  WeekDay,
} from './recurrence.type';

import { RRuleParser } from './recurrence.utils';

export function IsValidRecurrencePattern(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsValidRecurrencePattern',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!value) return true; // Allow null/undefined for optional recurrence

          if (typeof value === 'string') {
            try {
              // Try to parse as RRULE
              RRuleParser.stringToRRule(value);
              return true;
            } catch {
              return false;
            }
          }

          if (typeof value === 'object') {
            // Validate RecurrencePattern object
            const pattern = value as RRule;

            if (!Object.values(RRuleFrequency).includes(pattern.frequency)) {
              return false;
            }

            if (pattern.interval && (pattern.interval < 1 || pattern.interval > 999)) {
              return false;
            }

            if (pattern.byWeekDay) {
              const validDays = Object.values(WeekDay);
              if (!pattern.byWeekDay.every((day) => validDays.includes(day))) {
                return false;
              }
            }

            if (pattern.byMonthDay && (pattern.byMonthDay < 1 || pattern.byMonthDay > 31)) {
              return false;
            }

            return true;
          }

          return false;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid recurrence pattern (RRULE string or RecurrencePattern object)`;
        },
      },
    });
  };
}
