import LABELS from './labels.js';

let tally = {};
let max = 20;
let max_key = `${max}+`;
for (let label of LABELS) {
	let len = explode_cp(label).length;
	if (len >= max) len = max_key;	
	tally[len] = (tally[len] ?? 0) + 1;
}
console.log(tally);
console.log(LABELS.length);

function explode_cp(s) {
	let cps = [];
	for (let pos = 0, len = s.length; pos < len; ) {
		let cp = s.codePointAt(pos);
		pos += cp < 0x10000 ? 1 : 2;
		cps.push(cp);
	}
	return cps;
}