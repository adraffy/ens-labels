// render the label length distribution (see lengthTally) as an SVG bar chart,
// with an inset of the UTF-8 byte length distribution (see byteTally)
// colored by how many storage words each length takes as a Solidity string

import type { ByteTally } from "./stats.ts";

const W = 1600;
const H = 1000;
const M = { top: 150, right: 30, bottom: 70, left: 100 };
const FONT = `system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif`;
const INK = "#888";
const WASH = "rgba(136,136,136,0.15)";
const GRID = "rgba(136,136,136,0.3)";
const WORD = 31; // max bytes of a string that fits in one storage word

function niceStep(max: number, ticks = 10) {
	const raw = max / ticks;
	const mag = 10 ** Math.floor(Math.log10(raw));
	return [1, 2, 2.5, 5, 10].map((x) => x * mag).find((x) => x >= raw)!;
}

function formatCount(n: number) {
	return n >= 1e6 ? `${n / 1e6}M` : n >= 1e3 ? `${n / 1e3}K` : String(n);
}

function formatPercent(n: number, total: number) {
	const p = (100 * n) / total;
	return `${p >= 1 ? p.toFixed(2) : p.toPrecision(2)}%`;
}

// storage words of a Solidity string of n bytes:
// short (≤ 31) is 1 word, long is 1 length word + ⌈n / 32⌉ data words
function storageWords(n: number) {
	return n <= WORD ? 1 : 1 + Math.ceil(n / 32);
}

// a color per word count; 2 (exactly 32 bytes) stands out
const WORD_COLORS = ["#3889ff", "#ff3b30", "#a855f7", "#ec4899", "#f97316", "#eab308", "#84cc16", "#22c55e", "#14b8a6"];
function wordColor(words: number) {
	return WORD_COLORS[(words - 1) % WORD_COLORS.length]!;
}

// .eth pricing tiers by codepoint length: 3 gold, 4 silver, 5+ bronze
const GOLD = "#d4a017";
const SILVER = "#9ea3ab";
const BRONZE = "#c06a2b";
function tierColor(length: number) {
	return length >= 5 ? BRONZE : length === 4 ? SILVER : length === 3 ? GOLD : INK;
}

function escape(s: string) {
	return s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
}

function pillWidth(text: string, size: number) {
	return text.length * size * 0.56 + 12;
}

// text on a rounded wash, (x, y) is the left baseline
function pill(text: string, x: number, y: number, size: number, extra = "") {
	const w = pillWidth(text, size);
	const h = size * 1.3;
	return [
		`<g ${extra}>`,
		`<rect x="${x - 6}" y="${y - size * 0.98}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="4" fill="${WASH}"/>`,
		`<text x="${x}" y="${y}" font-size="${size}">${escape(text)}</text>`,
		`</g>`,
	].join("");
}

// tally[0] (the empty label) counts toward the total but isn't drawn
export function renderChart(tally: number[], bytes: ByteTally) {
	const total = tally.reduce((a, b) => a + b, 0);
	const lengths = tally.length - 1; // 1 to max+
	const max = Math.max(...tally.slice(1));
	const step = niceStep(max);
	const top = Math.ceil(max / step) * step;
	const plotW = W - M.left - M.right;
	const plotH = H - M.top - M.bottom;
	const barW = plotW / lengths;
	const y = (n: number) => M.top + plotH * (1 - n / top);

	const out: string[] = [
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family='${FONT}' fill="${INK}">`,
	];

	// grid + y ticks
	for (let n = step; n <= top; n += step) {
		const gy = y(n).toFixed(1);
		out.push(`<line x1="${M.left}" x2="${W - M.right}" y1="${gy}" y2="${gy}" stroke="${GRID}" stroke-dasharray="4 4"/>`);
		out.push(`<text x="${M.left - 10}" y="${gy}" font-size="22" text-anchor="end" dominant-baseline="middle">${formatCount(n)}</text>`);
	}

	// total, in the empty top-left corner
	out.push(`<text x="${M.right}" y="${M.right + 40}" font-size="44" font-weight="bold">${total.toLocaleString("en-US")}</text>`);
	out.push(pill("Labels", M.right + 6, M.right + 76, 24, `font-weight="bold"`));

	// bars
	tally.forEach((n, i) => {
		if (!i) return;
		const x = M.left + (i - 1) * barW;
		const cx = x + barW / 2;
		const by = y(n);
		const label = i === tally.length - 1 ? `${i}+` : String(i);
		out.push(`<rect x="${(x + 1).toFixed(1)}" y="${by.toFixed(1)}" width="${(barW - 2).toFixed(1)}" height="${(M.top + plotH - by).toFixed(1)}" fill="${tierColor(i)}"/>`);
		out.push(`<text x="${cx.toFixed(1)}" y="${(by - 10).toFixed(1)}" font-size="${label.length > 2 ? 22 : 26}" font-weight="bold" text-anchor="middle">${label}</text>`);
		const py = by - 44;
		out.push(pill(formatPercent(n, total), cx - 7, py, 18, `transform="rotate(-90 ${cx.toFixed(1)} ${py.toFixed(1)}) translate(0 7)"`));
	});

	// inset in the top-right quarter, above the short bars:
	// from the top edge (inset by the right margin) to halfway down the plot
	const inset = { x: M.left + plotW / 2 + 20, y: M.right, right: W - M.right, bottom: M.top + plotH / 2 - 20 };
	out.push(renderInset(bytes, {
		x: inset.x,
		y: inset.y,
		w: inset.right - inset.x,
		h: inset.bottom - inset.y,
	}));

	// labels by codepoint tier (.eth pricing: 3, 4, 5+), boxed under the inset
	// rows colored like their bars
	const tiers: Row[] = [
		["3", tally[3] ?? 0, GOLD],
		["4", tally[4] ?? 0, SILVER],
		["5+", tally.slice(5).reduce((a, b) => a + b, 0), BRONZE],
	];
	out.push(renderTable(tiers, total, { x: W - M.right - 340, y: inset.bottom + 20, w: 340 }));

	// axes
	const base = M.top + plotH;
	out.push(`<line x1="${M.left}" x2="${W - M.right}" y1="${base}" y2="${base}" stroke="${INK}" stroke-width="2"/>`);
	out.push(`<line x1="${M.left}" x2="${M.left}" y1="${M.top - 30}" y2="${base}" stroke="${INK}" stroke-width="2"/>`);
	out.push(axisTitle("Codepoints", M.left + plotW / 2, base + 45, 24));

	out.push(`</svg>`);
	return out.join("\n");
}

type Box = { x: number; y: number; w: number; h: number };

// bars of labels by UTF-8 byte length, 1 to bytes.max, log scale, colored by storage words
function renderInset({ counts, max: maxBytes, over }: ByteTally, box: Box) {
	const P = { top: 20, right: 24, bottom: 96, left: 64 };
	const x0 = box.x + P.left;
	const y0 = box.y + P.top;
	const w = box.w - P.left - P.right;
	const h = box.h - P.top - P.bottom;
	const values = counts.slice(1, maxBytes + 1);
	const decades = Math.ceil(Math.log10(Math.max(...values)));
	const floor = -0.3; // log10 of the baseline, so a count of 1 is still visible
	const barW = w / maxBytes;
	const y = (n: number) => y0 + h * (1 - (Math.log10(n) - floor) / (decades - floor));
	const base = y0 + h;

	const out = [
		`<g>`,
		`<rect x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" rx="12" fill="${WASH}"/>`,
	];
	for (let d = 0; d <= decades; d++) {
		const gy = y(10 ** d).toFixed(1);
		out.push(`<line x1="${x0}" x2="${x0 + w}" y1="${gy}" y2="${gy}" stroke="${GRID}" stroke-dasharray="4 4"/>`);
		out.push(`<text x="${x0 - 8}" y="${gy}" font-size="16" text-anchor="end" dominant-baseline="middle">${formatCount(10 ** d)}</text>`);
	}
	// notes go between the top two grid lines, above the short tail bars
	const noteY = y(10 ** (decades - 0.5)).toFixed(1);
	if (over) {
		out.push(`<text x="${x0 + w}" y="${noteY}" font-size="16" text-anchor="end" dominant-baseline="middle">+${over.toLocaleString("en-US")} over ${maxBytes}</text>`);
	}
	// bars (byte length i + 1), colored by storage words
	const cx = (bytes: number) => x0 + (bytes - 0.5) * barW;
	const top = (bytes: number) => y(Math.max(1, counts[bytes]!)) - 3;
	values.forEach((n, i) => {
		if (!n) return;
		const by = y(n);
		out.push(`<rect x="${(x0 + i * barW).toFixed(2)}" y="${by.toFixed(1)}" width="${barW.toFixed(2)}" height="${(base - by).toFixed(1)}" fill="${wordColor(storageWords(i + 1))}"/>`);
	});
	out.push(`<line x1="${x0}" x2="${x0 + w}" y1="${base}" y2="${base}" stroke="${INK}" stroke-width="1.5"/>`);

	// word count of each group, centered under its bytes
	for (let words = 1; storageWords(maxBytes) >= words; words++) {
		if (words === 2) continue; // a single length, marked with an arrow below
		const lo = words === 1 ? 1 : 32 * (words - 2) + 1;
		const hi = Math.min(maxBytes, words === 1 ? WORD : 32 * (words - 1));
		out.push(`<text x="${((cx(lo) + cx(hi)) / 2).toFixed(1)}" y="${base + 22}" font-size="18" font-weight="bold" text-anchor="middle" fill="${wordColor(words)}">${words}</text>`);
	}
	// 1 word (short string: up to 31 bytes + length): a level arrow pointing
	// back at the edge of the group, with its share of all labels
	const total = counts.reduce((a, b) => a + b, 0) + over;
	const word = counts.slice(0, WORD + 1).reduce((a, b) => a + b, 0);
	const level = 10 ** (decades - 1);
	let edge = 1;
	for (let b = 1; b <= WORD; b++) if (counts[b]! >= level) edge = b;
	const one = { x: x0 + edge * barW + 3, y: y(level) };
	const tail = { x: x0 + (WORD + 6) * barW, y: one.y };
	out.push(arrow(tail, one, wordColor(1)));
	out.push(`<text x="${(tail.x + 6).toFixed(1)}" y="${one.y.toFixed(1)}" font-size="18" fill="${wordColor(1)}" dominant-baseline="middle"><tspan font-weight="bold">1 word</tspan><tspan x="${(tail.x + 6).toFixed(1)}" dy="22" font-size="16">(${((100 * word) / total).toFixed(2)}%)</tspan></text>`);

	// 32 bytes is the only 2-word length: label it from the right,
	// above the shorter 3-word bars, with an arrow to the top of its bar
	const two = { x: cx(WORD + 1) + 2, y: top(WORD + 1) };
	const from = { x: two.x + 36, y: two.y - 18 };
	out.push(arrow(from, two, wordColor(2)));
	out.push(`<text x="${(from.x + 6).toFixed(1)}" y="${from.y.toFixed(1)}" font-size="18" font-weight="bold" fill="${wordColor(2)}" dominant-baseline="middle">2 words</text>`);

	// byte ticks
	for (const b of [1, 32, 64, 96, 128, 160, 192, 224, maxBytes]) {
		const tx = cx(b).toFixed(1);
		out.push(`<line x1="${tx}" x2="${tx}" y1="${base}" y2="${base + 4}" stroke="${INK}"/>`);
		out.push(`<text x="${tx}" y="${base + 46}" font-size="16" text-anchor="middle">${b}</text>`);
	}
	out.push(axisTitle("Bytes", x0 + w / 2, base + 80, 18));
	out.push(`</g>`);
	return out.join("\n");
}

// bold pill centered on x
function axisTitle(text: string, cx: number, y: number, size: number) {
	return pill(text, cx - pillWidth(text, size) / 2 + 6, y, size, `font-weight="bold"`);
}

type Point = { x: number; y: number };

// line from `from` with an arrowhead at `tip`
function arrow(from: Point, tip: Point, color: string) {
	const len = Math.hypot(tip.x - from.x, tip.y - from.y);
	const [ux, uy] = [(tip.x - from.x) / len, (tip.y - from.y) / len];
	const head = (side: number) => `${(tip.x - 10 * ux + side * 5 * uy).toFixed(1)} ${(tip.y - 10 * uy - side * 5 * ux).toFixed(1)}`;
	return [
		`<line x1="${from.x.toFixed(1)}" y1="${from.y.toFixed(1)}" x2="${(tip.x - 8 * ux).toFixed(1)}" y2="${(tip.y - 8 * uy).toFixed(1)}" stroke="${color}" stroke-width="2"/>`,
		`<path d="M${tip.x.toFixed(1)} ${tip.y.toFixed(1)} L${head(1)} L${head(-1)} z" fill="${color}"/>`,
	].join("");
}

type Row = [key: string, count: number, color: string];

// boxed table: codepoints, labels, share of total
function renderTable(rows: Row[], total: number, { x, y, w }: { x: number; y: number; w: number }) {
	const rowH = 32;
	const h = 20 + rowH * (rows.length + 1);
	const cols = [x + 24, x + w - 120, x + w - 24]; // left, right, right
	const out = [`<g font-size="20">`, `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${WASH}"/>`];
	const head = y + 10 + rowH * 0.7;
	out.push(`<text x="${cols[0]}" y="${head}" font-size="16" font-weight="bold">Codepoints</text>`);
	out.push(`<text x="${cols[1]}" y="${head}" font-size="16" font-weight="bold" text-anchor="end">Labels</text>`);
	out.push(`<text x="${cols[2]}" y="${head}" font-size="16" font-weight="bold" text-anchor="end">%</text>`);
	rows.forEach(([key, n, color], i) => {
		const ty = head + rowH * (i + 1);
		out.push(`<g fill="${color}">`);
		out.push(`<circle cx="${cols[0]! + 7}" cy="${ty - 7}" r="8" stroke="rgba(0,0,0,0.25)" stroke-width="1.5"/>`);
		out.push(`<text x="${cols[0]! + 24}" y="${ty}" font-weight="bold">${key}</text>`);
		out.push(`<text x="${cols[1]}" y="${ty}" text-anchor="end">${n.toLocaleString("en-US")}</text>`);
		out.push(`<text x="${cols[2]}" y="${ty}" text-anchor="end">${formatPercent(n, total)}</text>`);
		out.push(`</g>`);
	});
	out.push(`</g>`);
	return out.join("\n");
}
