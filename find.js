// node find.js <labelhash>
// node find.js -n <namehash>

import {read_labels} from './labels.js';
import {keccak, bytes_from_hex, hex_from_bytes} from '@adraffy/keccak';

let hasher = labelhash;
let args = process.argv.slice(2).filter(arg => {
	switch (arg) {
		case '-n':
		case '--name':
			hasher = namehash;
			break;
		default: return true;
	}
});
if (!args.length) {
	console.error('expected hash');
	process.exit(1);
}

let hash = bytes_from_hex(args[0]);
if (hash.length !== 32) {
	console.error('expected 32-byte hash');
	process.exit(1);
}
console.log(`${hasher.name}: 0x${hex_from_bytes(hash)}`);

for (let label of read_labels()) {
	if (!Buffer.compare(hasher(label), hash)) {
		console.log({label});
		process.exit(0);
	}
}
console.log('No match!');
process.exit(1);


function labelhash(label) {
	return keccak().update(label).bytes;
}
function namehash(name) {
	let buf = new Uint8Array(64); 
	if (name) {
		for (let label of name.split('.').reverse()) {
			buf.set(keccak().update(label).bytes, 32);
			buf.set(keccak().update(buf).bytes, 0);
		}
	}
	return buf.subarray(0, 32);
}