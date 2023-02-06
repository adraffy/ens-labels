import {read_labels} from './labels.js';
import {readFileSync, writeFileSync} from 'node:fs';

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

let summary = `\`${count}\` unique, stop-free labels as of \`${date}\``;

let table = [
	`| N | # | % |`,
	`| :--- | ---: | ---: |`,
	...Object.entries(tally).map(([k, v]) => {
		return `| ${k} | ${v} | ${(100*v/LABELS.length).toFixed(4)}% |`;
	})
].join('\n');

console.log(summary);

if (process.argv[2] === 'save') {
	let file = new URL('./README.md', import.meta.url);
	let text = readFileSync(file, {encoding: 'utf-8'});
	let vars = {summary, table};
	text = text.replace(/<!--\s*([a-z]+)\s*-->.*?<!--\s*\/\1\s*-->/gmsu, (_, k) => {
		let value = vars[k];
		if (!value) throw new Error(`expected var: "${k}"`);
		return `<!-- ${k} -->\n${value}\n<!-- /${k} -->`;
	});
	writeFileSync(file, text);
	console.log(`Updated: ${file}`);
} else {
	console.log(table);
}
