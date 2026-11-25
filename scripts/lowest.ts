// the known labels with the smallest labelhashes
// usage: bun run lowest [-n 10]

import { parseArgs } from "node:util";
import { openDB } from "../src/db.ts";
import { toHex } from "../src/hash.ts";

const { values } = parseArgs({
	options: {
		limit: { type: "string", short: "n", default: "10" },
	},
});

const db = openDB();
const rows = db
	.query<{ hash: Uint8Array; label: string | null }, [number]>("SELECT hash, label FROM labels ORDER BY hash LIMIT ?")
	.all(Number(values.limit));
db.close();

for (const { hash, label } of rows) {
	console.log(toHex(hash), JSON.stringify(label));
}
