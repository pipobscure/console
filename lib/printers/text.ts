import type { LogLevel, WriteFunction } from './main';

const colors = {
	Black: '\u001b[30m',
	Red: '\u001b[31m',
	Green: '\u001b[32m',
	Yellow: '\u001b[33m',
	Blue: '\u001b[34m',
	Magenta: '\u001b[35m',
	Cyan: '\u001b[36m',
	White: '\u001b[37m',
	BrightBlack: '\u001b[30;1m',
	BrightRed: '\u001b[31;1m',
	BrightGreen: '\u001b[32;1m',
	BrightYellow: '\u001b[33;1m',
	BrightBlue: '\u001b[34;1m',
	BrightMagenta: '\u001b[35;1m',
	BrightCyan: '\u001b[36;1m',
	BrightWhite: '\u001b[37;1m',
};
const reset = '\u001b[0m';

type Colorable = LogLevel | 'key' | 'object' | 'number' | 'string' | 'function' | 'bigint' | 'boolean' | 'symbol' | 'undefined' | 'regexp' | 'date' | 'array' | 'set' | 'map' | 'ref';
export type ColorScheme = { [k in Colorable]: keyof typeof colors };
type Colorizer = (mode: keyof ColorScheme, data: string) => string;
function color(this: ColorScheme | null, mode: keyof ColorScheme, data: string): string {
	if (this === null) return data;
	return `${colors[this[mode]]}${data}${reset}`;
}

const defaultColors: ColorScheme = {
	trace: 'Black',
	dir: 'Black',
	count: 'Black',
	countReset: 'Black',
	group: 'Black',
	groupCollapsed: 'Black',
	groupEnd: 'Black',
	timeLog: 'Black',
	timeEnd: 'Black',
	assert: 'Black',
	debug: 'Black',
	log: 'Black',
	info: 'Black',
	warn: 'Black',
	error: 'Red',
	key: 'Black',
	object: 'Black',
	string: 'Black',
	function: 'Black',
	number: 'Black',
	bigint: 'Black',
	boolean: 'Black',
	symbol: 'Black',
	undefined: 'Black',
	regexp: 'Black',
	date: 'Black',
	array: 'Black',
	set: 'Black',
	map: 'Black',
	ref: 'Black',
};

class TextPrinter {
	#out: WriteFunction;
	#colorize: Colorizer;
	constructor(out: WriteFunction, colorize?: Partial<ColorScheme>) {
		this.#out = out;
		this.#colorize = color.bind(colorize ? Object.assign(Object.assign({}, defaultColors), colorize) : null);
		this.print = this.print.bind(this);
	}
	print(level: LogLevel, data: any[]) {
		if (!['trace', 'debug', 'log', 'info', 'warn', 'error', 'count', 'timeLog', 'timeEnd'].includes(level)) return;
		this.#out(this.#colorize(level, `${new Date().toISOString()} [${level.toUpperCase()}]`));
		let first = true;
		for (const piece of data) {
			const sub = stringify(piece, this.#colorize).split(/\r?\n/);
			if (sub.length === 1 && first) {
				this.#out(` ${sub[0]}`);
			} else {
				first = false;
				for (const line of sub) this.#out(`\n\t${line}`);
			}
		}
		this.#out(`\n`);
	}
}

export default function (out: WriteFunction, colors?: Partial<ColorScheme>) {
	return new TextPrinter(out, colors).print;
}

function stringify(obj: any, colorize: Colorizer, seen: WeakSet<any> = new WeakSet()): string {
	if (!obj || 'object' !== typeof obj) return colorize(typeof Object, `${obj && 'function' === typeof obj.toString ? obj.toString() : obj}`);

	if (obj instanceof Date) {
		return colorize('date', `<${obj.toISOString()}>`);
	}
	if (obj instanceof RegExp) {
		return colorize('regexp', `/${obj.source}/${obj.flags}`);
	}
	if (obj instanceof Error) {
		return colorize('error', obj.stack || obj.message);
	}
	if (obj instanceof WeakMap) {
		return colorize('map', `${obj}`);
	}
	if (obj instanceof WeakSet) {
		return colorize('set', `${obj}`);
	}
	if ('undefined' !== typeof WeakRef && obj instanceof WeakRef) {
		return colorize('ref', `${obj}`);
	}

	if (seen.has(obj)) return colorize('object', `<circular>`);
	seen.add(obj);

	if (Array.isArray(obj)) {
		const lines = [];
		lines.push(colorize('array', '['));
		let first = true;
		for (const item of obj) {
			if (!first) lines[lines.length - 1] = `${lines[lines.length - 1]}${colorize('array', ',')}`;
			first = false;
			const sub = stringify(item, colorize, seen).split(/\r?\n/);
			lines.push(...sub.map((l) => `\t${l}`));
		}
		lines.push(colorize('array', ']'));
		return lines.join('\n');
	}

	if (obj instanceof Set) {
		const lines = [];
		lines.push(colorize('set', 'Set<'));
		let first = true;
		for (const item of obj) {
			if (!first) lines[lines.length - 1] = `${lines[lines.length - 1]}${colorize('set', ',')}`;
			first = false;
			const sub = stringify(item, colorize, seen).split(/\r?\n/);
			lines.push(...sub.map((l) => `\t${l}`));
		}
		lines.push(colorize('set', '>'));
		return lines.join('\n');
	}

	if (obj instanceof Map) {
		const lines = [];
		lines.push(colorize('map', 'Map<'));
		let first = true;
		for (const [key, val] of Object.entries(obj)) {
			if (!first) lines[lines.length - 1] = `${lines[lines.length - 1]},`;
			first = false;
			const sub = `${stringify(key, colorize, seen)}${colorize('map', ' : ')}${stringify(val, colorize, seen)}`.split(/\r?\n/);
			lines.push(...sub.map((l) => `\t${l}`));
		}
		lines.push(colorize('map', '>'));
		return colorize('map', lines.join('\n'));
	}

	const lines = [];
	lines.push(colorize('object', '{'));
	let first = true;
	for (const [key, val] of Object.entries(obj)) {
		if (!first) lines[lines.length - 1] = `${lines[lines.length - 1]}${colorize('object', ',')}`;
		first = false;
		const sub = `${colorize('key', key.toString ? key.toString() : key)}${colorize('object', ': ')}${stringify(val, colorize, seen)}`.split(/\r?\n/);
		lines.push(...sub.map((l) => `\t${l}`));
	}
	lines.push(colorize('object', '}'));
	return lines.join('\n');
}
