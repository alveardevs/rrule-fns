"use strict";
// =================== VALIDATION DECORATOR ===================
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsValidRecurrencePattern = IsValidRecurrencePattern;
const class_validator_1 = require("class-validator");
const recurrence_type_1 = require("./recurrence.type");
const recurrence_utils_1 = require("./recurrence.utils");
function IsValidRecurrencePattern(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'IsValidRecurrencePattern',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value, args) {
                    if (!value)
                        return true; // Allow null/undefined for optional recurrence
                    if (typeof value === 'string') {
                        try {
                            // Try to parse as RRULE
                            recurrence_utils_1.RRuleParser.stringToRRule(value);
                            return true;
                        }
                        catch (_a) {
                            return false;
                        }
                    }
                    if (typeof value === 'object') {
                        // Validate RecurrencePattern object
                        const pattern = value;
                        if (!Object.values(recurrence_type_1.RRuleFrequency).includes(pattern.frequency)) {
                            return false;
                        }
                        if (pattern.interval && (pattern.interval < 1 || pattern.interval > 999)) {
                            return false;
                        }
                        if (pattern.byWeekDay) {
                            const validDays = Object.values(recurrence_type_1.WeekDay);
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
                defaultMessage(args) {
                    return `${args.property} must be a valid recurrence pattern (RRULE string or RecurrencePattern object)`;
                },
            },
        });
    };
}
