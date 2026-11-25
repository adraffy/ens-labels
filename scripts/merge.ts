// merge labels into the database (existing labels are kept)
// usage: bun run merge [file.json ...] [-l <label> ...]
//   file.json: a JSON array of labels or names (names are split into labels)
//   default: labels.json

import { parseArgs } from "node:util";
import { LABELS_FILE } from "../src/config.ts";
import { openDB } from "../src/db.ts";
import { mergeLabels } from "../src/merge.ts";

const { values, positionals } = parseArgs({
	allowPositionals: true,
	options: {
		label: { type: "string", short: "l", multiple: true },
	},
});

const files = positionals.length || values.label ? positionals : [LABELS_FILE.pathname];
const db = openDB();
for (const file of files) {
	const names: string[] = await Bun.file(file).json();
	console.log(`Merged: +${mergeLabels(db, names)} of ${names.length} from ${file}`);
}
if (values.label) {
	console.log(`Merged: +${mergeLabels(db, values.label)} of ${values.label.length} from args`);
}
db.close();
