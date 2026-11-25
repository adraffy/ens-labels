# AGENTS.md

Unique ENS labels, published as [`labels.json`](./labels.json). Labels come from the legacy collection (ENS contract events and primary names) plus `Label` events indexed from the ENSv2 LabelStore.

## Stack

- [Bun](https://bun.sh) + TypeScript, no build step: run `.ts` files directly.
- [viem](https://viem.sh) for RPC, ABI decoding, and hashing. Don't hand-roll what viem provides.
- `bun:sqlite` for the local database, `node:util` `parseArgs` for CLI flags.
- camelCase everywhere, including database meta keys.

## Layout

- `src/` is library code: config, database, RPC client, hashing, sorting, stats, chart rendering.
- `scripts/` holds one CLI entrypoint per `package.json` script, each parsing args with `parseArgs`.
- `demo.html` is a single static page with no build. Its dependencies are pinned jsDelivr ESM URLs, and labels are hashed in an inline module worker.
- `favicon.svg`, `plot.svg`, and `README.md` are partly generated (see below).

## Commands

```sh
bun i
bun run check    # tsc --noEmit, run after any TypeScript change
bun run update   # index → labels → chart → readme
bun run demo     # serve the repo at http://localhost:8787/demo.html
```

Other scripts: `index [--to <block>]`, `labels`, `chart`, `readme`, `merge [file.json…] [-l <label>…]`, `invert <hash> | -n <namehash> [-p <parent>]`, `lowest [-n 10]`.

## Data

- `labels.db` (SQLite, gitignored) is the source of truth. A fresh database is seeded from `labels.json`, so nothing is lost when it's rebuilt.
  - `labels(hash, label, raw, block)`: `hash` is `keccak256(utf8(label))`. `raw` holds the bytes when a label isn't valid UTF-8. `block` is the first LabelStore block that emitted it, or NULL if the label is legacy only.
  - `meta`: `address`, `lastBlock`, `lastTimestamp`, `step`.
- `labels.json` invariants. `bun run labels` enforces them, so keep them when changing it:
  - stop-free (no `.`) and valid UTF-8; the DB keeps the rest
  - sorted by codepoint length, then UTF-8 bytes (equivalent to codepoint order)
  - `JSON.stringify(list, null, "\t")`, written only when the content changes
  - additions only: a diff that removes or reorders labels is a bug
- The LabelStore address and deployment block are in `src/config.ts`. Set `RPC_URL` to override the default public RPC, which allows wide `eth_getLogs` ranges.

## Indexer rules

- Index only up to the `finalized` block, so reorgs can't affect stored data.
- Each block range commits in one transaction together with `lastBlock`. Keep it that way: it's what makes ^C and crashes safe to resume.
- The range size adapts. Shrink it on provider limit errors (use the suggested range when the error gives one) and on viem's response-size limit.
- Labels are hashed as raw bytes. Don't use viem's `labelhash()` for stored labels: it maps `""` to zero and decodes `[hex]` labels.

## Generated content

- `bun run readme` replaces `<!-- key -->…<!-- /key -->` sections in `README.md` and `demo.html` (`summary`, `table`, `longest`, `size`). Edit around the markers, not inside them.
- `plot.svg` comes from `bun run chart`. Don't edit it by hand.

## Demo

- Resolve links go to `https://raffy.xyz/ens/`: `#<label>.eth` for a known label, `#id:0x<hash>` otherwise.
- Hashes match on the high 224 bits, so ENSv2 token IDs (low 32 bits = version) find their label.
- Verify changes in a browser via `bun run demo`, in both light and dark mode.
