// render the label length distribution of labels.json as plot.svg
// usage: bun run chart [--max 30]

import { parseArgs } from "node:util";
import { CHART_FILE } from "../src/config.ts";
import { renderChart } from "../src/chart.ts";
import { lengthTally, readLabels } from "../src/stats.ts";

const { values } = parseArgs({
	options: {
		max: { type: "string", default: "30" },
		out: { type: "string", short: "o", default: CHART_FILE.pathname },
	},
});

const tally = lengthTally(await readLabels(), Number(values.max));
await Bun.write(values.out, renderChart(tally));
console.log(`Wrote: ${values.out}`);
