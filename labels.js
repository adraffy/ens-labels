import {readFileSync} from 'node:fs';

export function read_labels() {
	return JSON.parse(readFileSync(new URL('./labels.json', import.meta.url)));
}
