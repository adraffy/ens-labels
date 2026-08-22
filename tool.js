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
		for (const label of labels) {
			const len = [...label].length;
			let bucket = this.get(len);
			if (!bucket) {
				bucket = [];
				this.set(len, bucket);
			}
			bucket.push(label);
		}
	}
	create_length_tally(max) {
		const v = [];
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
		const lines = [
			`| N | # | % |`,
			`| ---: | ---: | ---: |`
		];
		const total = tally.reduce((a, x) => a + x, 0);
		lines.push(...tally.map((n, i) => {
			return `| ${i}${i===tally.length-1?'+':''} | ${n} | ${(100*n/total).toFixed(perc)}% |`;
		}));
		return lines.join('\n');
	}
	find_longest(ge) {
		const sorted = [...this.keys()].sort((a, b) => a-b);
		const found = [];
		while (found.length < ge) {
			found.push(...this.get(sorted.pop()));
		}
		return found;
	}
	make_longest_table(labels) {
		if (!Array.isArray(labels)) {
			labels = this.find_longest(labels || 20);
		}
		const lines = [
			`| N | Bytes | Labelhash |`,
			`| ---: | ---: | :--- |`
		];
		for (const s of labels) {
			const hash = keccak().update(s).hex;
			lines.push(`| ${[...s].length} | ${Buffer.from(s).length} | [\`${hash}\`](https://adraffy.github.io/ens-normalize.js/test/resolver.html#token:0x${hash})`);
		}
		return lines.join('\n');
	}
}

if (mode === 'sync') {
	//let set = new Set(labels.filter(x => !x.includes('.')));
	merge(await fetch('https://alpha.antistupid.com/ens-regs/all.json').then(r => r.json()));

} else if (mode === 'add') {
	merge(args);

} else if (mode === 'text') {

	const length_map = new LengthMap(labels);
	const count = new Intl.NumberFormat('en-US').format(labels.length);
	const date = new Date().toJSON().split('T')[0];
	
	const size = (statSync(file).size / (1<<20)).toFixed(1) + 'MB';
	const hash = createHash('sha256').update(data).digest('hex');
	
	const summary = `
\`${count}\` unique, stop-free labels as of \`${date}\` collected from ENS contract events and primary name records.

* [\`${size}\`](https://github.com/adraffy/ens-labels/raw/master/labels.json) — [labels.json](./labels.json)<br>\`${hash}\` (SHA256)
`.trim();
	
	const files = [
		new URL('./README.md', import.meta.url),
		new URL('./demo.html', import.meta.url)
	];
	const vars = {
		summary,
		table: length_map.make_length_table(),
		longest: length_map.make_longest_table(),
		size,
	};
	for (const f of files) {
		let text = readFileSync(f, {encoding: 'utf-8'});
		text = text.replace(/<!--\s*([a-z]+)\s*-->.*?<!--\s*\/\1\s*-->/gmsu, (all, k) => {
			let value = vars[k];
			if (!value) throw new Error(`expected var: "${k}"`);
			if (all.includes('\n')) value = `\n${value}\n`;
			return `<!-- ${k} -->${value}<!-- /${k} -->`;
		});
		writeFileSync(f, text);
		console.log(`Updated: ${f}`);
	}
} else if (mode === 'table.md') {
	console.log(new LengthMap(labels).make_length_table(parseInt(args[0])));

} else if (mode === 'longest.md') {
	console.log(new LengthMap(labels).make_longest_table(parseInt(args[0])));

} else if (mode === 'table') {
	console.log(new LengthMap(labels).create_length_tally(parseInt(args[0]) || 50));

} else if (mode === 'longest') {
	console.log(new LengthMap(labels).find_longest(parseInt(args[0]) || 50).map(s => [...s].length));

} else if (mode === 'nc') { // namechain collision
	const bits = BigInt(args.shift() ?? 32);
	const map = new Map();
	let found = 0;
	for (const label of labels) {
		const key = BigInt('0x' + keccak().update(label).hex) >> bits;
		const old = map.get(key);
		if (old !== undefined) {
			console.log(`[${++found}] "${old}" vs "${label}"`);
			throw 1;
		} else {
			map.set(key, label);
		}
	}

} else {
	throw new Error(`unknown mode: ${mode}`);
}

function explode_cp(s) {
	return Array.from(s, c => c.codePointAt(0));
}

function compare_arrays(a, b) {
	let n = a.length;
	let c = n - b.length;
	for (let i = 0; c === 0 && i < n; i++) c = a[i] - b[i];
	return c;
}

function merge(newLabels) {
	let set = new Set(labels);
	console.log(`Before: ${labels.length}`);
	for (const label of newLabels) {
		// 20240910: this was using registered labels which might contain a stop
		for (const part of label.split('.')) { 
			set.add(part);
		}
	}
	// 20240915: why wasn't i sorting this?!
	set = [...set].map(explode_cp).sort(compare_arrays).map(x => String.fromCodePoint(...x));
	const added = set.length - labels.length;
	console.log(` After: ${set.length} (+${added})`);
	if (added) {
		writeFileSync(file, JSON.stringify(set, null, '\t'));
	}
}