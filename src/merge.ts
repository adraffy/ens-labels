import { countLabels, type DB } from "./db.ts";
import { labelhash } from "./hash.ts";

// add labels to the database, names are split into labels
// existing labels are kept, returns the number added
export function mergeLabels(db: DB, names: Iterable<string>) {
	const before = countLabels(db).total;
	const insert = db.query("INSERT OR IGNORE INTO labels (hash, label) VALUES (?, ?)");
	db.transaction(() => {
		for (const name of names) {
			for (const label of name.split(".")) {
				insert.run(labelhash(label), label);
			}
		}
	})();
	return countLabels(db).total - before;
}
