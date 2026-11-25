// find the label for a hash
// usage:
//   bun run invert <labelhash | tokenId>         labelhash, or any ENSv2 id (low 32 bits ignored)
//   bun run invert -n <namehash> [-p <parent>]   namehash of <label>.<parent> (default: root)

import { parseArgs } from "node:util";
import { hexToBytes, namehash } from "viem";
import { LABEL_STORE } from "../src/config.ts";
import { openDB } from "../src/db.ts";
import { childhash, parseBytes32, toHex } from "../src/hash.ts";
import { client, labelStoreAbi } from "../src/rpc.ts";

type Row = { hash: Uint8Array; label: string | null; raw: Uint8Array | null; block: number | null };

const { values, positionals } = parseArgs({
	allowPositionals: true,
	options: {
		name: { type: "boolean", short: "n" },
		parent: { type: "string", short: "p", default: "" },
	},
});
if (positionals.length !== 1) {
	console.error("usage: invert <labelhash | tokenId> | invert -n <namehash> [-p <parent>]");
	process.exit(1);
}

function show(row: Row, note?: string) {
	console.log({
		label: row.label ?? undefined,
		raw: row.raw ? toHex(row.raw) : undefined,
		labelhash: toHex(row.hash),
		labelStoreBlock: row.block ?? undefined,
		note,
	});
}

const target = parseBytes32(positionals[0]!);
const db = openDB();
let found = 0;

if (values.name) {
	console.log(`namehash: ${target} (parent: "${values.parent}")`);
	const node = hexToBytes(namehash(values.parent));
	const want = Buffer.from(hexToBytes(target));
	for (const row of db.query<Row, []>("SELECT * FROM labels").iterate()) {
		if (want.equals(childhash(node, row.hash))) {
			show(row);
			found++;
			break;
		}
	}
} else {
	console.log(`labelhash: ${target}`);
	// ENSv2 ids replace the low 32 bits of the labelhash with a version
	const lo = hexToBytes(target);
	const hi = lo.slice();
	lo.fill(0x00, 28);
	hi.fill(0xff, 28);
	const rows = db.query<Row, [Uint8Array, Uint8Array]>("SELECT * FROM labels WHERE hash BETWEEN ? AND ?").all(lo, hi);
	for (const row of rows) {
		show(row, toHex(row.hash) === target ? undefined : "matched ignoring version bits");
		found++;
	}
	if (!found) {
		const label = await client.readContract({
			address: LABEL_STORE,
			abi: labelStoreAbi,
			functionName: "getLabel",
			args: [BigInt(target)],
		});
		if (label) {
			console.log({ label, note: "from LabelStore.getLabel(), run `bun run index` to sync" });
			found++;
		}
	}
}

db.close();
if (!found) {
	console.log("No match!");
	process.exit(1);
}
