import {read_labels} from './labels.js';

const LABELS = read_labels();

let tally = {};
let max = 30;
let max_key = `${max}+`;
for (let label of LABELS) {
	let len = [...label].length;
	if (len >= max) len = max_key;	
	tally[len] = (tally[len] ?? 0) + 1;
}
console.log(tally);
console.log(LABELS.length);
