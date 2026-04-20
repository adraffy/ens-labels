import { readFileSync } from "node:fs";
import { keccak } from "@adraffy/keccak";

const n = parseInt(process.argv[2]) || 10;
console.log(n);

const found = [];

for (const label of JSON.parse(
	readFileSync(new URL("./labels.json", import.meta.url)),
)) {
	const id = BigInt("0x" + keccak().update(label).hex);
	if (found.length < n) {
		found.push(id);
		if (found.length === n) {
			found.sort((a, b) => (a < b ? -1 : 1));
		}
	} else {
		let i = n;
		while (i > 0 && found[i - 1] > id) --i;
		if (i < n) {
			found.splice(i, 0, id);
			found.pop();
		}
	}
}

console.log();
console.log(new Date());
found.forEach((x) => console.log("0x" + x.toString(16).padStart(64, "0")));

// 2026-04-13T02:21:54.597Z
// 0x00000425b4462e19460bedb4bccfcf16d270975ef882f03831bf3d40f7342355
// 0x000008a51dfcb3e27040cf86337c239b16af1fb6be1519250ee6a495ab11c762
// 0x00000a84132c08f14b780b230921d313076f87449f9a8aeb42c7d8ed748011db
// 0x00000d2d44db55b19c072cd2928d3e91486e21b3533c3b7298cc3415e0061f59
// 0x0000140a7d7816a16b879ca9b9a1f86320b4e20c69daed14e75df90afbfc90ee
// 0x00001f90a6d927d53789b5ba315e713ba1f6a5eee6765d5ab992bad9df74c00a
// 0x0000230c759aca1da57b688c928f2787b400879fc42acfebb5ea1da364882872
// 0x0000245730cdb291fa3209deeb84dbd36f6a66730cb4d3fd442c0f264f4077ee
// 0x00002518355a46c8ea789e5ed468a0d986400eaae45be0dd8a89d07a0c85c099
// 0x0000258ae2621e4447f75a10f3a00db125d60411be1e87b42f48b26e4a3b5990
