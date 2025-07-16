"use strict";
// =================== TYPES & VALIDATION ===================
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeekDay = exports.RRuleFrequency = void 0;
var RRuleFrequency;
(function (RRuleFrequency) {
    RRuleFrequency["DAILY"] = "DAILY";
    RRuleFrequency["WEEKLY"] = "WEEKLY";
    RRuleFrequency["MONTHLY"] = "MONTHLY";
    RRuleFrequency["YEARLY"] = "YEARLY";
})(RRuleFrequency || (exports.RRuleFrequency = RRuleFrequency = {}));
var WeekDay;
(function (WeekDay) {
    WeekDay["MO"] = "MO";
    WeekDay["TU"] = "TU";
    WeekDay["WE"] = "WE";
    WeekDay["TH"] = "TH";
    WeekDay["FR"] = "FR";
    WeekDay["SA"] = "SA";
    WeekDay["SU"] = "SU";
})(WeekDay || (exports.WeekDay = WeekDay = {}));
