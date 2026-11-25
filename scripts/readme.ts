// fill the <!-- key -->...<!-- /key --> sections of README.md and demo.html
// usage: bun run readme

import { existsSync, readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { DB_FILE, DEMO_FILE, LABEL_STORE, LABELS_FILE, README_FILE } from "../src/config.ts";
import { countLabels, getMeta, openDB } from "../src/db.ts";
import { labelhash, toHex } from "../src/hash.ts";
import { lengthTally, longestLabels, percent, parseLabels } from "../src/stats.ts";

parseArgs({ options: {} }); // no options, rejects stray args

const fmt = new Intl.NumberFormat("en-US");

function lengthTable(tally: number[]) {
	const total = tally.reduce((a, b) => a + b, 0);
	return [
		`| N | # | % |`,
		`| ---: | ---: | ---: |`,
		...tally.map((n, i) => `| ${i}${i === tally.length - 1 ? "+" : ""} | ${n} | ${percent(n, total)} |`),
	].join("\n");
}

function longestTable(labels: string[]) {
	return [
		`| N | Bytes | Labelhash |`,
		`| ---: | ---: | :--- |`,
		...labels.map((s) => {
			const hash = toHex(labelhash(s)).slice(2);
			return `| ${[...s].length} | ${Buffer.byteLength(s)} | [\`${hash}\`](https://adraffy.github.io/ens-normalize.js/test/resolver.html#token:0x${hash})`;
		}),
	].join("\n");
}

function indexState() {
	if (!existsSync(DB_FILE)) return;
	const db = openDB();
	try {
		const block = getMeta<number>(db, "lastBlock");
		const timestamp = getMeta<number>(db, "lastTimestamp");
		if (block === undefined) return;
		return { block, timestamp, store: countLabels(db).store };
	} finally {
		db.close();
	}
}

const data = readFileSync(LABELS_FILE);
const labels = parseLabels(data);
const state = indexState();

const size = `${(data.length / (1 << 20)).toFixed(1)}MB`;
const sha256 = new Bun.CryptoHasher("sha256").update(data).digest("hex");
const date = new Date(state?.timestamp ? state.timestamp * 1000 : Date.now()).toJSON().split("T")[0];
const source = state
	? `ENS contract events, primary name records, and the [ENSv2 LabelStore](https://etherscan.io/address/${LABEL_STORE}) (\`${fmt.format(state.store)}\` labels through block [\`${state.block}\`](https://etherscan.io/block/${state.block}))`
	: `ENS contract events and primary name records`;

const vars: Record<string, string> = {
	summary: `
\`${fmt.format(labels.length)}\` unique, stop-free labels as of \`${date}\` collected from ${source}.

* [\`${size}\`](https://github.com/adraffy/ens-labels/raw/master/labels.json) — [labels.json](./labels.json)<br>\`${sha256}\` (SHA256)
`.trim(),
	table: lengthTable(lengthTally(labels)),
	longest: longestTable(longestLabels(labels)),
	size,
};

for (const url of [README_FILE, DEMO_FILE]) {
	const f = Bun.file(url);
	const text = (await f.text()).replace(/<!--\s*([a-z]+)\s*-->.*?<!--\s*\/\1\s*-->/gsu, (all, k: string) => {
		let value = vars[k];
		if (value === undefined) throw new Error(`unknown section: "${k}" in ${url.pathname}`);
		if (all.includes("\n")) value = `\n${value}\n`;
		return `<!-- ${k} -->${value}<!-- /${k} -->`;
	});
	await Bun.write(f, text);
	console.log(`Updated: ${url.pathname}`);
}
