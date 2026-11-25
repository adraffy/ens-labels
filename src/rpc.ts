import { createPublicClient, http, parseAbi, RpcRequestError, BaseError, ResponseBodyTooLargeError } from "viem";
import { mainnet } from "viem/chains";
import { RPC_URL } from "./config.ts";

export const client = createPublicClient({
	chain: mainnet,
	transport: http(RPC_URL, {
		retryCount: 5,
		retryDelay: 1000,
		timeout: 120_000,
		maxResponseBodySize: 64 << 20, // 20k logs is ~14MB
	}),
});

export const labelStoreAbi = parseAbi([
	"event Label(bytes32 indexed labelHash, string label)",
	"function getLabel(uint256 anyId) view returns (string)",
]);

export const labelEvent = labelStoreAbi[0];

// providers reject wide eth_getLogs queries, many suggest a smaller range
// eg. "Query returned more than 20000 results. Try with this block range [0x18e55ce, 0x18e5f2a]."
export function rangeError(err: unknown): { message: string; range?: [bigint, bigint] } | undefined {
	if (!(err instanceof BaseError)) return;
	if (err.walk((e) => e instanceof ResponseBodyTooLargeError)) return { message: err.shortMessage };
	const rpc = err.walk((e) => e instanceof RpcRequestError) as RpcRequestError | null;
	if (!rpc) return;
	const message = [rpc.details, rpc.data].filter((x) => typeof x === "string").join(": ");
	const match = message.match(/\[\s*(0x[0-9a-f]+)\s*,\s*(0x[0-9a-f]+)\s*\]/i);
	return { message, range: match ? [BigInt(match[1]!), BigInt(match[2]!)] : undefined };
}
