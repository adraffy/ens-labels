import { Database } from "bun:sqlite";
import { DB_FILE } from "./config.ts";

export type DB = Database;

export function openDB(file = DB_FILE): DB {
	const db = new Database(file, { create: true, strict: true });
	db.run("PRAGMA journal_mode = WAL");
	db.run("PRAGMA synchronous = NORMAL");
	db.run(`
		CREATE TABLE IF NOT EXISTS labels (
			hash  BLOB PRIMARY KEY, -- keccak256(label)
			label TEXT,             -- NULL if not valid UTF-8
			raw   BLOB,             -- original bytes if not valid UTF-8
			block INTEGER           -- first LabelStore block, NULL if only legacy
		) WITHOUT ROWID
	`);
	db.run(`
		CREATE TABLE IF NOT EXISTS meta (
			key   TEXT PRIMARY KEY,
			value ANY
		) WITHOUT ROWID
	`);
	return db;
}

export function getMeta<T extends string | number>(db: DB, key: string): T | undefined {
	const row = db
		.query<{ value: T }, [string]>("SELECT value FROM meta WHERE key = ?")
		.get(key);
	return row?.value;
}

export function setMeta(db: DB, key: string, value: string | number) {
	db.query(
		"INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
	).run(key, value);
}

export function countLabels(db: DB) {
	return db
		.query<{ total: number; store: number }, []>(
			"SELECT COUNT(*) AS total, COUNT(block) AS store FROM labels",
		)
		.get()!;
}
