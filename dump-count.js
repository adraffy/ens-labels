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

let count = new Intl.NumberFormat('en-US').format(LABELS.length);
let date = new Date().toJSON().split('T')[0];

console.log(`\`${count}\` unique, stop-free labels as of \`${date}\``);
//console.log(tally);
console.log(`| N | # | % |`);
console.log(`| :--- | ---: | ---: |`);
Object.entries(tally).forEach(([k, v]) => {
	console.log(`| ${k} | ${v} | ${(100*v/LABELS.length).toFixed(4)}% |`);
});