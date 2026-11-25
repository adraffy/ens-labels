import { concat, hexToBytes, keccak256, stringToBytes, toHex, type Hex } from "viem";

// keccak256 of the literal label
// (viem's labelhash() maps "" to 0x0 and decodes "[hex]" labels, which is wrong for raw labels)
export function labelhash(label: string | Uint8Array): Uint8Array {
	return keccak256(typeof label === "string" ? stringToBytes(label) : label, "bytes");
}

// namehash(label + "." + parent) from namehash(parent) and labelhash(label)
export function childhash(parent: Uint8Array, labelHash: Uint8Array): Uint8Array {
	return keccak256(concat([parent, labelHash]), "bytes");
}

// accepts 0x-hex, bare 64-char hex, or decimal (eg. a tokenId)
export function parseBytes32(s: string): Hex {
	let v: bigint;
	try {
		v = BigInt(/^[0-9a-f]{64}$/i.test(s) ? `0x${s}` : s);
	} catch {
		throw new Error(`expected bytes32: ${s}`);
	}
	if (v < 0n || v >> 256n) throw new Error(`expected bytes32: ${s}`);
	return toHex(v, { size: 32 });
}

export { hexToBytes, toHex };
