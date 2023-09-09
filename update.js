import {read_labels} from './labels.js';
import {readFileSync, writeFileSync, statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {keccak} from '@adraffy/keccak';

const mode = process.argv[2];
const args = process.argv.slice(3);

const labels_file = new URL('./labels.json', import.meta.url);
const LABELS = read_labels();

const length_map = new Map();
for (let label of LABELS) {
	let len = [...label].length;
	let bucket = length_map.get(len);
	if (!bucket) {
		bucket = [];
		length_map.set(len, bucket);
	}
	bucket.push(label);
}


let count = new Intl.NumberFormat('en-US').format(LABELS.length);
let date = new Date().toJSON().split('T')[0];

let size = (statSync(labels_file).size / (1<<20)).toFixed(1) + 'MB';
let hash = createHash('sha256').update(readFileSync(labels_file)).digest('hex');

let summary = `\`${count}\` unique, stop-free labels as of \`${date}\` collected from ENS contract events and primary name records. 
 * [\`${size}\`](https://github.com/adraffy/ens-labels/raw/master/labels.json) — [labels.json](./labels.json)<br>\`${hash}\` (SHA256)`;

function create_length_tally(max) {
	let v = [];
	for (let n = 0; n < max; n++) {
		v.push(length_map.get(n)?.length|0);
	}
	v.push([...length_map].filter(([n]) => n >= max).reduce((a, [_, v]) => a + v.length, 0));
	return v;
}

function find_longest(want) {
	let sorted = [...length_map.keys()].sort((a, b) => a-b);
	let found = [];
	while (found.length < want) {
		found.push(...length_map.get(sorted.pop()));
	}
	return found;
}

function make_length_table(tally, perc = 4) {
	if (!tally) tally = 30;
	if (typeof tally === 'number') tally = create_length_tally(tally);
	let lines = [
		`| N | # | % |`,
		`| ---: | ---: | ---: |`
	];
	let total = tally.reduce((a, x) => a + x, 0);
	lines.push(...tally.map((n, i) => {
		return `| ${i}${i===tally.length-1?'+':''} | ${n} | ${(100*n/total).toFixed(perc)}% |`;
	}));
	return lines.join('\n');
}

function make_longest_table(labels) {
	if (!labels) labels = 20;
	if (typeof labels === 'number') labels = find_longest(labels);
	let lines = [
		`| N | Bytes | Labelhash |`,
		`| ---: | ---: | :--- |`
	];
	for (let s of labels) {
		let hash = keccak().update(s).hex;
		lines.push(`| ${[...s].length} | ${Buffer.from(s).length} | [\`${hash}\`](https://adraffy.github.io/ens-normalize.js/test/resolver.html#token:0x${hash})`);
	}
	return lines.join('\n');
}

console.log({count, date, size});

if (mode === 'save') {
	let files = [
		new URL('./README.md', import.meta.url),
		new URL('./demo.html', import.meta.url)
	];
	let vars = {
		summary, 
		table: make_length_table(), 
		longest: make_longest_table(),
		size, 
	};
	for (let file of files) {
		let text = readFileSync(file, {encoding: 'utf-8'});
		
		text = text.replace(/<!--\s*([a-z]+)\s*-->.*?<!--\s*\/\1\s*-->/gmsu, (all, k) => {
			let value = vars[k];
			if (!value) throw new Error(`expected var: "${k}"`);
			if (all.includes('\n')) value = `\n${value}\n`;
			return `<!-- ${k} -->${value}<!-- /${k} -->`;
		});
		writeFileSync(file, text);
		console.log(`Updated: ${file}`);
	}
} else if (mode === 'md:table') {
	console.log(make_length_table(parseInt(args[0])));
} else if (mode === 'md:longest') {
	console.log(make_longest_table(parseInt(args[0])));
} else if (mode === 'table') {
	console.log(create_length_tally(50));
} else if (mode === 'longest') {
	console.log(find_longest(100).map(s => [...s].length));
}
