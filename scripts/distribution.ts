// write distribution.json: label counts by codepoint length and UTF-8 byte length
// usage: bun run distribution

import { writeFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { DISTRIBUTION_FILE } from "../src/config.ts";
import { distribution, readLabels } from "../src/stats.ts";

const { values } = parseArgs({
	options: {
		out: { type: "string", short: "o", default: DISTRIBUTION_FILE.pathname },
	},
});

writeFileSync(values.out, JSON.stringify(distribution(readLabels()), null, "\t"));
console.log(`Wrote: ${values.out}`);
