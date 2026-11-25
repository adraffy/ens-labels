// build labels.json from the database: stop-free (no "."), valid UTF-8, sorted
// usage: bun run labels

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { LABELS_FILE } from "../src/config.ts";
import { openDB } from "../src/db.ts";
import { sortLabels } from "../src/sort.ts";

const { values } = parseArgs({
	options: {
		out: { type: "string", short: "o", default: LABELS_FILE.pathname },
	},
});

const db = openDB();
const rows = db.query<{ label: string }, []>("SELECT label FROM labels WHERE label IS NOT NULL").all();
const invalid = db.query<{ n: number }, []>("SELECT COUNT(*) AS n FROM labels WHERE label IS NULL").get()!.n;
db.close();

const labels = rows.map((r) => r.label).filter((s) => !s.includes("."));
const stopped = rows.length - labels.length;

const old = existsSync(values.out) ? readFileSync(values.out, "utf8") : undefined;
const before = old ? (JSON.parse(old) as string[]).length : 0;
const json = JSON.stringify(sortLabels(labels), null, "\t");
const changed = old !== json;
if (changed) writeFileSync(values.out, json);

const delta = labels.length - before;
console.log(`Labels: ${labels.length} (${delta < 0 ? "" : "+"}${delta})`);
console.log(`Excluded: ${stopped} with stop, ${invalid} invalid UTF-8`);
console.log(changed ? `Wrote: ${values.out}` : "Unchanged");
