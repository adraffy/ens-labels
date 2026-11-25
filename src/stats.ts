import { readFileSync } from "node:fs";
import { LABELS_FILE } from "./config.ts";

export function parseLabels(data: Buffer): string[] {
	return JSON.parse(data.toString());
}

export function readLabels() {
	return parseLabels(readFileSync(LABELS_FILE));
}

// count of labels by codepoint length: [0, 1, ..., max-1, max+]
export function lengthTally(labels: string[], max = 30) {
	const tally = new Array<number>(max + 1).fill(0);
	for (const label of labels) tally[Math.min(max, [...label].length)]!++;
	return tally;
}

export type ByteTally = { counts: number[]; max: number; over: number };

// count of labels by UTF-8 byte length: counts[0..max], and how many are longer
export function byteTally(labels: string[], max = 255): ByteTally {
	const counts = new Array<number>(max + 1).fill(0);
	let over = 0;
	for (const label of labels) {
		const n = Buffer.byteLength(label);
		if (n > max) over++;
		else counts[n]!++;
	}
	return { counts, max, over };
}

// full distribution by codepoint length and UTF-8 byte length
export function distribution(labels: string[]) {
	const codepoints: Record<number, number> = {};
	const bytes: Record<number, number> = {};
	for (const label of labels) {
		const cps = [...label].length;
		const n = Buffer.byteLength(label);
		codepoints[cps] = (codepoints[cps] ?? 0) + 1;
		bytes[n] = (bytes[n] ?? 0) + 1;
	}
	return { total: labels.length, codepoints, bytes };
}

// the longest labels, including every label tied with the last one
export function longestLabels(labels: string[], min = 20) {
	const sorted = labels
		.map((s) => ({ s, n: [...s].length }))
		.sort((a, b) => b.n - a.n);
	let i = Math.min(min, sorted.length);
	while (i < sorted.length && sorted[i]!.n === sorted[i - 1]!.n) i++;
	return sorted.slice(0, i).map((x) => x.s);
}
