// serve the repo to try demo.html locally
// usage: bun run demo [--port 8787]

import { parseArgs } from "node:util";

const { values } = parseArgs({
	options: {
		port: { type: "string", short: "p", default: process.env.PORT ?? "8787" },
	},
});

const root = new URL("../", import.meta.url);

const server = Bun.serve({
	port: Number(values.port),
	async fetch(req) {
		const path = decodeURIComponent(new URL(req.url).pathname);
		const file = Bun.file(new URL(`.${path === "/" ? "/demo.html" : path}`, root));
		if (path.includes("..") || !(await file.exists())) return new Response("Not Found", { status: 404 });
		return new Response(file);
	},
});

console.log(`Demo: ${server.url}demo.html`);
