import {read_labels} from './labels.js';
import {readFileSync, writeFileSync} from 'node:fs';

let mode;
let max = 30;
let args = process.argv.slice(2).filter(arg => {
	if (arg === 'md' || arg === 'save') {
		mode = arg;
	} else if (/^\d+$/.test(arg)) {
		max = parseInt(arg);
	} else {
		return true;
	}
});

const LABELS = read_labels();

let tally = {};
let max_key = `${max}+`;
for (let label of LABELS) {
	let len = [...label].length;
	if (len >= max) len = max_key;	
	tally[len] = (tally[len] ?? 0) + 1;
}

let count = new Intl.NumberFormat('en-US').format(LABELS.length);
let date = new Date().toJSON().split('T')[0];

let summary = `\`${count}\` unique, stop-free labels as of \`${date}\``;

function make_md_table() {
	return [
		`| N | # | % |`,
		`| :--- | ---: | ---: |`,
		...Object.entries(tally).map(([k, v]) => {
			return `| ${k} | ${v} | ${(100*v/LABELS.length).toFixed(4)}% |`;
		})
	].join('\n');
}

console.log(summary);

if (mode === 'save') {
	let file = new URL('./README.md', import.meta.url);
	let text = readFileSync(file, {encoding: 'utf-8'});
	let vars = {summary, table: make_md_table()};
	text = text.replace(/<!--\s*([a-z]+)\s*-->.*?<!--\s*\/\1\s*-->/gmsu, (_, k) => {
		let value = vars[k];
		if (!value) throw new Error(`expected var: "${k}"`);
		return `<!-- ${k} -->\n${value}\n<!-- /${k} -->`;
	});
	writeFileSync(file, text);
	console.log(`Updated: ${file}`);
} else if (mode === 'md') {
	console.log(make_md_table());
} else {
	let pad = Math.max(...Object.values(tally)).toString().length;
	let perc = 4;
	Object.entries(tally).forEach(([k, v]) => {
		console.log(`${k.padStart(max_key.length)} ${v.toString().padStart(pad)} ${(100*v/LABELS.length).toFixed(perc).padStart(4+perc)}%`);
	});
}
