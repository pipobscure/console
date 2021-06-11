import type { PrinterFunction, LogLevel } from './printers/main';

export const hasOwn = Object.prototype.hasOwnProperty.call.bind(Object.prototype.hasOwnProperty);

export function createTrace() {
	const err = new Error('trace');
	const stack = (err.stack || '').split(/\r?\n/)[3];
	const match = stack.replace(/^.*\((.*)\).*$/, '$1');
	return match;
}
export function logger(this: PrinterFunction<any>, level: LogLevel, args: any[]): void {
	if (!args.length) return;
	const [first, ...rest] = args;
	if (!rest.length) {
		this(level, [first]);
	} else if ('string' !== typeof first) {
		this(level, args);
	} else {
		this(level, formatter(args));
	}
}
export function formatter(args: any[]) {
	const [first, ...rest] = args;
	let target = `${first}`
		.split('%%')
		.join('\u0000')
		.replace(/%[sdifoOc]/g, (spec: string) => {
			if (!rest.length) return spec;
			let current = rest.shift();
			let converted: undefined | string = undefined;
			switch (spec) {
				case '%s':
					return `${current}`;
				case '%i':
				case '%d':
					if ('symbol' === typeof current) current = Number.NaN;
					converted = `${parseInt(current, 10)}`;
					break;
				case '%f':
					if ('symbol' === typeof current) current = Number.NaN;
					converted = `${parseFloat(current)}`;
					break;
				case '%o':
					if (current && 'function' === typeof current.toString) {
						converted = current.toString();
					} else {
						converted = `${current}`;
					}
					break;
				case '%O':
					try {
						converted = JSON.stringify(current);
					} catch {
						if (current && 'function' === typeof current.toString) {
							converted = current.toString();
						} else {
							converted = `${current}`;
						}
					}
					break;
				case '%c':
					break;
			}
			return converted !== undefined ? converted : spec;
		})
		.split('\u0000')
		.join('%%');

	return [target, ...rest];
}

interface Sender {
	(data: string): void;
}
interface Receiver {
	readonly data: string;
	clear: () => void;
}
type Cache = Sender & Receiver;
export function createCache() {
	const recv: string[] = [];
	const write: Partial<Cache> = (data: string) => {
		recv.push(data);
	};
	Object.defineProperty(write, 'data', {
		get: () => recv.join(''),
		enumerable: true,
		configurable: true,
	});
	write.clear = () => {
		recv.splice(0, recv.length);
	};
	return write as Cache;
}
