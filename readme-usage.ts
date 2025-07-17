// =================== USAGE EXAMPLES ===================
// tsx path/to/this/file/readme-usage.ts

import { RRule, RRuleFrequency, WeekDay } from './src/recurrence.type';
import {
    RRuleParser,
    generateRecurrenceDates,
    dateMatchesPattern,
    describeRRule,
    isValidRRule,
} from './src/recurrence.utils';

const recurrencia: RRule = {
    frequency: RRuleFrequency.WEEKLY,
    byWeekDay: [WeekDay.MO, WeekDay.SU],
    // byMonthDay: 20,
    // bySetPos?: number, 
    interval: 4,
    // count: 5,
    until: new Date('2025-12-30'),
}

console.log('\n====== PARSE OBJECT A STRING (RFC 5545) =======\n');
const recurrenceString = RRuleParser.toString(recurrencia);
console.log(recurrenceString);
// FREQ=WEEKLY;INTERVAL=4;BYDAY=MO,SU;UNTIL=20251230T000000Z

console.log('\n====== DESCRIBE RECURRENCE =======\n');
console.log(describeRRule(recurrenceString));
// Every 4 weeks on mo, su, until 12/30/2025

console.log('\n====== OBTENER FECHAS QUE COINCIDAN EL PATRON =======\n');
const fechas = generateRecurrenceDates(new Date(), recurrenceString, undefined, new Date('2025-07-30'));
console.log(fechas);
// [
//   '2025-06-22', // Domingo
//   '2025-06-23', // Lunes
//   '2025-07-20', // Domingo
//   '2025-07-21', // Lunes
//   '2025-08-17'  // Domingo
// ]

console.log('\n====== PARSE STRING A OBJECT =======\n');
const objeto = RRuleParser.stringToRRule(recurrenceString);
console.log(JSON.stringify(objeto));
// {"frequency":"WEEKLY","interval":4,"byWeekDay":["MO","SU"],"until":"2025-12-30T00:00:00.000Z"}


console.log('\n====== ¿ESTA FECHA CUMPLE? =======\n');
console.log('Esta si (es lunes): ' + dateMatchesPattern('2025-06-16', new Date('2025-06-14'), recurrenceString))
console.log('Esta no (es otro día): ' + dateMatchesPattern('2025-06-25', new Date('2025-06-14'), recurrenceString))
// Esta si (es lunes): true
// Esta no (es otro día): false


console.log('\n====== ¿ ES UNA REGLA RRULE VÁLIDA ? =======\n');
console.log(isValidRRule(recurrenceString))
console.log(isValidRRule('akjsdf'))
// True 
// False (no está funcionando bien)

console.log('\n==============================\n');
console.log(objeto.byWeekDay)
console.log('\n==============================\n');

console.log(JSON.stringify(objeto))
console.log(RRuleParser.toString(objeto))
console.log('\n==============================\n');

