// index Label events from the ENSv2 LabelStore into the database
// resumes from the last indexed block, stops at the finalized head
// usage: bun run index [--to <block>]

import { parseArgs } from "node:util";
import { decodeAbiParameters, hexToBytes, stringToBytes, type Log } from "viem";
import { LABEL_STORE, LABEL_STORE_BLOCK, LABELS_FILE, RPC_URL } from "../src/config.ts";
import { countLabels, getMeta, openDB, setMeta } from "../src/db.ts";
import { labelhash, toHex } from "../src/hash.ts";
import { client, labelEvent, rangeError } from "../src/rpc.ts";
import { mergeLabels } from "../src/merge.ts";

type LabelLog = Log<bigint, number, false, typeof labelEvent, true>;

const MAX_STEP = 200_000n;
const GROW_BELOW = 5_000; // grow the range when a query returns fewer logs

const utf8 = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true });

function decodeLabel({ args, data, blockNumber }: LabelLog) {
	let raw = stringToBytes(args.label);
	let hash = labelhash(raw);
	if (toHex(hash) !== args.labelHash) {
		// viem's string decode is lossy (invalid UTF-8, leading BOM): use the raw bytes
		raw = hexToBytes(decodeAbiParameters([{ type: "bytes" }], data)[0]);
		hash = labelhash(raw);
		if (toHex(hash) !== args.labelHash) {
			throw new Error(`labelhash mismatch at block ${blockNumber}: ${args.labelHash}`);
		}
	}
	let label: string | null = null;
	try {
		label = utf8.decode(raw);
	} catch {}
	return { hash, label, raw: label === null ? raw : null, block: Number(blockNumber) };
}

const { values } = parseArgs({
	options: {
		to: { type: "string" }, // stop at this block instead of the finalized head
	},
});
const stopAt = values.to ? BigInt(values.to) : undefined;

const db = openDB();

// each range commits atomically with last_block, so any exit resumes cleanly:
// ^C once to finish the current range, twice to quit now (the in-flight range is refetched)
let stopping = false;
process.on("SIGINT", () => {
	if (stopping) {
		console.log(`\nAborted, resume from block ${(getMeta<number>(db, "last_block") ?? LABEL_STORE_BLOCK - 1) + 1}`);
		process.exit(130);
	}
	stopping = true;
	console.log("\nStopping after this range (^C again to quit now)");
});

// a fresh database starts from the published labels
if (!countLabels(db).total && (await Bun.file(LABELS_FILE).exists())) {
	const labels: string[] = await Bun.file(LABELS_FILE).json();
	console.log(`Merged: +${mergeLabels(db, labels)} from labels.json`);
}

const chainId = await client.getChainId();
if (chainId !== client.chain.id) throw new Error(`expected chain ${client.chain.id}, got ${chainId}: ${RPC_URL}`);
if ((getMeta<string>(db, "address") ?? LABEL_STORE) !== LABEL_STORE) {
	throw new Error(`database indexes a different LabelStore: ${getMeta(db, "address")}`);
}
setMeta(db, "address", LABEL_STORE);

const head = await client.getBlock({ blockTag: "finalized" });
const end = stopAt !== undefined && stopAt < head.number ? stopAt : head.number;
const start = BigInt(getMeta<number>(db, "last_block") ?? LABEL_STORE_BLOCK - 1) + 1n;
let step = BigInt(getMeta<number>(db, "step") ?? 2_000);

console.log(`RPC: ${RPC_URL}`);
console.log(`LabelStore: ${LABEL_STORE}`);
console.log(`Blocks: ${start} → ${end} (finalized ${head.number})`);

const upsert = db.query(`
	INSERT INTO labels (hash, label, raw, block) VALUES (?, ?, ?, ?)
	ON CONFLICT(hash) DO UPDATE SET block = excluded.block WHERE block IS NULL
`);
const commit = db.transaction((logs: LabelLog[], to: bigint) => {
	let added = 0;
	for (const log of logs) {
		const { hash, label, raw, block } = decodeLabel(log);
		added += upsert.run(hash, label, raw, block).changes;
	}
	setMeta(db, "last_block", Number(to));
	setMeta(db, "step", Number(step));
	if (to === head.number) setMeta(db, "last_timestamp", Number(head.timestamp));
	return added;
});

const t0 = performance.now();
let events = 0;
for (let from = start; from <= end && !stopping; ) {
	const to = from + step - 1n < end ? from + step - 1n : end;
	let logs: LabelLog[];
	try {
		logs = await client.getLogs({
			address: LABEL_STORE,
			event: labelEvent,
			fromBlock: from,
			toBlock: to,
			strict: true,
		});
	} catch (err) {
		const e = rangeError(err);
		if (!e || step === 1n) throw err;
		const hint = e.range;
		step = hint && hint[0] === from && hint[1] >= from && hint[1] < to ? hint[1] - from + 1n : step / 2n;
		console.log(`  too large, retry with ${step} blocks (${e.message})`);
		continue;
	}
	const added = commit(logs, to);
	events += logs.length;
	const pct = Number((10000n * (to - start + 1n)) / (end - start + 1n)) / 100;
	console.log(`[${pct.toFixed(1).padStart(5)}%] ${from}-${to} (${to - from + 1n}): ${logs.length} events, +${added}`);
	if (logs.length < GROW_BELOW) step = step * 2n < MAX_STEP ? step * 2n : MAX_STEP;
	from = to + 1n;
}

const { total, store } = countLabels(db);
const secs = ((performance.now() - t0) / 1000).toFixed(1);
console.log(`Indexed ${events} events in ${secs}s`);
console.log(`Labels: ${total} (${store} from LabelStore) through block ${getMeta(db, "last_block")}`);
db.close();
