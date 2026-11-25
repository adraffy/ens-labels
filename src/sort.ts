// labels.json order: by codepoint length, then by codepoints
// (UTF-8 byte order is codepoint order, unlike UTF-16 string comparison)
export function sortLabels(labels: string[]) {
	return labels
		.map((s) => ({ s, n: [...s].length, utf8: Buffer.from(s) }))
		.sort((a, b) => a.n - b.n || Buffer.compare(a.utf8, b.utf8))
		.map((x) => x.s);
}
