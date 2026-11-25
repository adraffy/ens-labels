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

// the longest labels, including every label tied with the last one
export function longestLabels(labels: string[], min = 20) {
	const sorted = labels
		.map((s) => ({ s, n: [...s].length }))
		.sort((a, b) => b.n - a.n);
	let i = Math.min(min, sorted.length);
	while (i < sorted.length && sorted[i]!.n === sorted[i - 1]!.n) i++;
	return sorted.slice(0, i).map((x) => x.s);
}

export function percent(n: number, total: number, digits = 4) {
	return `${((100 * n) / total).toFixed(digits)}%`;
}
