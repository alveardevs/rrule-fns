export declare enum RRuleFrequency {
    DAILY = "DAILY",
    WEEKLY = "WEEKLY",
    MONTHLY = "MONTHLY",
    YEARLY = "YEARLY"
}
export declare enum WeekDay {
    MO = "MO",
    TU = "TU",
    WE = "WE",
    TH = "TH",
    FR = "FR",
    SA = "SA",
    SU = "SU"
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
