import { kor } from './selftest.js';
const fel = kor();
console.log(fel.length ? 'FEL:\n' + fel.join('\n') : 'Alla kontroller gröna');
process.exit(fel.length ? 1 : 0);
