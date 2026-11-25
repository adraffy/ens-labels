// public endpoint that serves wide eth_getLogs ranges (capped at 20k results)
// override with RPC_URL in the environment or a .env file
export const RPC_URL =
	process.env.RPC_URL ?? "https://gateway.tenderly.co/public/mainnet";

// ENSv2 LabelStore (mainnet)
// https://github.com/ensdomains/contracts-v2/blob/main/contracts/src/utils/LabelStore.sol
export const LABEL_STORE = "0x31e5e081fe38d15b3e8214ba5cb08dc4708b70ba";
export const LABEL_STORE_BLOCK = 26105294;

export const DB_FILE = process.env.DB_FILE ?? "labels.db";

const root = new URL("../", import.meta.url);
export const LABELS_FILE = new URL("labels.json", root);
export const README_FILE = new URL("README.md", root);
export const CHART_FILE = new URL("plot.svg", root);
export const DISTRIBUTION_FILE = new URL("distribution.json", root);
