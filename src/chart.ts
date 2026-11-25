// render the label length distribution (see lengthTally) as an SVG bar chart,
// with an inset of the UTF-8 byte length distribution (see byteTally)

import type { ByteTally } from "./stats.ts";

const W = 1600;
const H = 1000;
const M = { top: 150, right: 30, bottom: 70, left: 100 };
const FONT = `system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif`;
const INK = "#888";
const WASH = "rgba(136,136,136,0.15)";
const GRID = "rgba(136,136,136,0.3)";
const INSET = "#3889ff";

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

// purple → blue → green → yellow → red
function rainbow(t: number) {
	return `hsl(${Math.round(270 * (1 - t))} 75% 55%)`;
}

function escape(s: string) {
	return s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
}

// text on a rounded wash, (x, y) is the left baseline
function pill(text: string, x: number, y: number, size: number, extra = "") {
	const w = text.length * size * 0.56 + 12;
	const h = size * 1.3;
	return [
		`<g ${extra}>`,
		`<rect x="${x - 6}" y="${y - size * 0.98}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="4" fill="${WASH}"/>`,
		`<text x="${x}" y="${y}" font-size="${size}">${escape(text)}</text>`,
		`</g>`,
	].join("");
}

export function renderChart(tally: number[], bytes: ByteTally) {
	const total = tally.reduce((a, b) => a + b, 0);
	const max = Math.max(...tally);
	const step = niceStep(max);
	const top = Math.ceil(max / step) * step;
	const plotW = W - M.left - M.right;
	const plotH = H - M.top - M.bottom;
	const barW = plotW / tally.length;
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

	// bars
	tally.forEach((n, i) => {
		const x = M.left + i * barW;
		const cx = x + barW / 2;
		const by = y(n);
		const label = i === tally.length - 1 ? `${i}+` : String(i);
		out.push(`<rect x="${x.toFixed(1)}" y="${by.toFixed(1)}" width="${barW.toFixed(1)}" height="${(M.top + plotH - by).toFixed(1)}" fill="${rainbow(n / max)}"/>`);
		out.push(`<text x="${cx.toFixed(1)}" y="${(by - 10).toFixed(1)}" font-size="${label.length > 2 ? 22 : 26}" font-weight="bold" text-anchor="middle">${label}</text>`);
		const py = by - 44;
		out.push(pill(formatPercent(n, total), cx - 7, py, 18, `transform="rotate(-90 ${cx.toFixed(1)} ${py.toFixed(1)}) translate(0 7)"`));
	});

	// inset in the top-right quarter, above the short bars
	out.push(renderInset(bytes, {
		x: M.left + plotW / 2 + 20,
		y: M.top,
		w: plotW / 2 - 30,
		h: plotH / 2 - 20,
	}));

	// axes
	const base = M.top + plotH;
	out.push(`<line x1="${M.left}" x2="${W - M.right}" y1="${base}" y2="${base}" stroke="${INK}" stroke-width="2"/>`);
	out.push(`<line x1="${M.left}" x2="${M.left}" y1="${M.top - 30}" y2="${base}" stroke="${INK}" stroke-width="2"/>`);
	out.push(pill("Length", W - M.right - 90, base + 45, 24, `font-weight="bold"`));
	out.push(pill("Labels", M.left - 85, M.top - 50, 24, `font-weight="bold"`));

	out.push(`</svg>`);
	return out.join("\n");
}

type Box = { x: number; y: number; w: number; h: number };

// single-color bars of labels by UTF-8 byte length, 1 to bytes.max, log scale
function renderInset({ counts, max: maxBytes, over }: ByteTally, box: Box) {
	const P = { top: 40, right: 24, bottom: 44, left: 64 };
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
	if (over) {
		out.push(`<text x="${box.x + box.w - 20}" y="${box.y + 28}" font-size="16" text-anchor="end">+${over.toLocaleString("en-US")} over ${maxBytes}</text>`);
	}
	for (let d = 0; d <= decades; d++) {
		const gy = y(10 ** d).toFixed(1);
		out.push(`<line x1="${x0}" x2="${x0 + w}" y1="${gy}" y2="${gy}" stroke="${GRID}" stroke-dasharray="4 4"/>`);
		out.push(`<text x="${x0 - 8}" y="${gy}" font-size="16" text-anchor="end" dominant-baseline="middle">${formatCount(10 ** d)}</text>`);
	}
	values.forEach((n, i) => {
		if (!n) return;
		const by = y(n);
		out.push(`<rect x="${(x0 + i * barW).toFixed(2)}" y="${by.toFixed(1)}" width="${barW.toFixed(2)}" height="${(base - by).toFixed(1)}" fill="${INSET}"/>`);
	});
	for (const b of [1, 32, 64, 96, 128, 160, 192, 224, maxBytes]) {
		const tx = (x0 + (b - 0.5) * barW).toFixed(1);
		out.push(`<line x1="${tx}" x2="${tx}" y1="${base}" y2="${base + 6}" stroke="${INK}"/>`);
		out.push(`<text x="${tx}" y="${base + 26}" font-size="16" text-anchor="middle">${b}</text>`);
	}
	out.push(`<line x1="${x0}" x2="${x0 + w}" y1="${base}" y2="${base}" stroke="${INK}" stroke-width="1.5"/>`);
	out.push(`</g>`);
	return out.join("\n");
}
