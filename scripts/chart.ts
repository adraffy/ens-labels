// render the label length distribution of labels.json as plot.svg
// usage: bun run chart [--max 30]

import { parseArgs } from "node:util";
import { CHART_FILE } from "../src/config.ts";
import { renderChart } from "../src/chart.ts";
import { byteTally, lengthTally, readLabels } from "../src/stats.ts";

const { values } = parseArgs({
	options: {
		max: { type: "string", default: "30" },
		out: { type: "string", short: "o", default: CHART_FILE.pathname },
	},
});

const labels = readLabels();
await Bun.write(values.out, renderChart(lengthTally(labels, Number(values.max)), byteTally(labels)));
console.log(`Wrote: ${values.out}`);
