import REGISTERED from './registered.json' assert {type: 'json'};
import REVERSE from './reverse.json' assert {type: 'json'};

export {REVERSE, REGISTERED};

export default [...new Set([REGISTERED, REVERSE].flat().flatMap(s => s.split('.')))];
