import {readFileSync} from 'node:fs';

// these are guarenteed to be unique and stop-free
export function read_labels() {
	return JSON.parse(readFileSync(new URL('./labels.json', import.meta.url)));
}
