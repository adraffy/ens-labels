import {readFileSync, writeFileSync, statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {keccak} from '@adraffy/keccak';

const mode = process.argv[2];
const args = process.argv.slice(3);
const file = new URL('./labels.json', import.meta.url);
const data = readFileSync(file);
const labels = JSON.parse(data);

class LengthMap extends Map {
	constructor(labels) {
		super();
		this.add(labels);
	}
	add(labels) {
		for (let label of labels) {
			let len = [...label].length;
			let bucket = this.get(len);
			if (!bucket) {
				bucket = [];
				this.set(len, bucket);
			}
			bucket.push(label);
		}
	}
	create_length_tally(max) {
		let v = [];
		for (let n = 0; n < max; n++) {
			v.push(this.get(n)?.length|0);
		}
		v.push([...this].filter(([n]) => n >= max).reduce((a, [_, v]) => a + v.length, 0));
		return v;
	}
	make_length_table(tally, perc = 4) {
		if (!Array.isArray(tally)) {
			tally = this.create_length_tally(tally || 30);
		}
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
	find_longest(ge) {
		let sorted = [...this.keys()].sort((a, b) => a-b);
		let found = [];
		while (found.length < ge) {
			found.push(...this.get(sorted.pop()));
		}
		return found;
	}
	make_longest_table(labels) {
		if (!Array.isArray(labels)) {
			labels = this.find_longest(labels || 20);
		}
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
}

if (mode === 'sync') {
	//let set = new Set(labels.filter(x => !x.includes('.')));
	let set = new Set(labels);
	let {size} = set;
	console.log(`Before: ${size}`);
	for (let label of await fetch('https://alpha.antistupid.com/ens-regs/all.json').then(r => r.json())) {
		// 20240910: this was using registered labels which might contain a stop
		for (let part of label.split('.')) { 
			if (!set.has(part)) {
				set.add(part);
			}
		}
	}
	let added = set.size - size;
	console.log(` After: ${set.size} (+${added})`);
	if (added) {
		writeFileSync(file, JSON.stringify([...set], null, '\t'));
	}

} else if (mode === 'text') {

	let length_map = new LengthMap(labels);
	let count = new Intl.NumberFormat('en-US').format(labels.length);
	let date = new Date().toJSON().split('T')[0];
	
	let size = (statSync(file).size / (1<<20)).toFixed(1) + 'MB';
	let hash = createHash('sha256').update(data).digest('hex');
	
	let summary = `
\`${count}\` unique, stop-free labels as of \`${date}\` collected from ENS contract events and primary name records.

* [\`${size}\`](https://github.com/adraffy/ens-labels/raw/master/labels.json) — [labels.json](./labels.json)<br>\`${hash}\` (SHA256)
`.trim();
	
	let files = [
		new URL('./README.md', import.meta.url),
		new URL('./demo.html', import.meta.url)
	];
	let vars = {
		summary, 
		table: length_map.make_length_table(), 
		longest: length_map.make_longest_table(),
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
} else if (mode === 'table.md') {
	console.log(new LengthMap(labels).make_length_table(parseInt(args[0])));

} else if (mode === 'longest.md') {
	console.log(new LengthMap(labels).make_longest_table(parseInt(args[0])));

} else if (mode === 'table') {
	console.log(new LengthMap(labels).create_length_tally(parseInt(args[0]) || 50));

} else if (mode === 'longest') {
	console.log(new LengthMap(labels).find_longest(parseInt(args[0]) || 50).map(s => [...s].length));

} else {
	throw new Error(`unknown mode: ${mode}`);
}
