import type { PrinterFunction, LogLevel, Writers, WriteFunction, ColorScheme } from './printers/main';

import { hasOwn, createTrace, logger, formatter } from './utils';
import { createSplitPrinter, createTextPrinter } from './printers/main';

declare const tag: unique symbol;
export type Writer = { readonly [tag]: 'Writer' };
export type Printer = { readonly [tag]: 'Printer' };

export default class Console<T = undefined> {
	#logger: (level: LogLevel, data: any[]) => void;
	#printer: PrinterFunction<T>;
	constructor(printer: PrinterFunction<T>) {
		this.#logger = logger.bind(printer);
		this.#printer = printer;
	}
	assert(condition: any, ...data: any[]) {
		if (!!condition) return;
		let message = 'Assertion Failed!';
		if (!data.length) {
			data.push(message);
		} else {
			let first = data[0];
			if ('string' !== typeof first) {
				data.unshift(message);
			} else {
				data[0] = `${message}: ${first}`;
			}
		}
		this.#logger('assert', data);
	}
	debug(...data: any[]) {
		this.#logger('debug', data);
	}
	error(...data: any[]) {
		this.#logger('error', data);
	}
	info(...data: any[]) {
		this.#logger('info', data);
	}
	log(...data: any[]) {
		this.#logger('log', data);
	}
	table(_data: object, _properties: any) {
		// TODO
		throw new Error('not implemented');
	}
	trace(...data: any[]) {
		const trace = createTrace();
		if (data.length) {
			const [formatted] = formatter(data);
			this.#printer('trace', [formatted, trace]);
		} else {
			this.#printer('trace', [trace]);
		}
	}
	warn(...data: any[]) {
		this.#logger('warn', data);
	}
	dir(item: any, options?: T) {
		const object = JSON.stringify(item);
		if (object === undefined) return;
		this.#printer('dir', [object], options);
	}
	dirxml(..._data: any[]) {
		// TODO
		throw new Error('not implemented');
	}

	#countmap: { [key: string]: number } = {};
	count(label: any) {
		const string = `${label}`;
		this.#countmap[string] = this.#countmap[string] || 0;
		this.#countmap[string] += 1;
		const concat = `${string}: ${this.#countmap[string]}`;
		this.#logger('count', [concat]);
	}
	countReset(label: any) {
		const string = `${label}`;
		if (hasOwn(this.#countmap, string)) {
			this.#countmap[string] = 0;
		} else {
			const message = `${string} is not a counter`;
			this.#logger('countReset', [message]);
		}
	}

	#groupstack: string[] = [];
	group(...data: any[]) {
		let groupLabel = `group ${this.#groupstack.length + 1}`;
		if (data.length) {
			[groupLabel] = formatter(data);
		}
		this.#printer('group', [groupLabel]);
		this.#groupstack.push(groupLabel);
	}
	groupCollapsed(...data: any[]) {
		let groupLabel = `group ${this.#groupstack.length + 1}`;
		if (data.length) {
			[groupLabel] = formatter(data);
		}
		this.#printer('groupCollapsed', [groupLabel]);
		this.#groupstack.push(groupLabel);
	}
	groupEnd() {
		const group = this.#groupstack.pop();
		if ('string' !== typeof group) return;
		this.#printer('groupEnd', [group]);
	}

	#timertable: { [timer: string]: number } = {};
	time(label: any) {
		const string = `${label}`;
		if (hasOwn(this.#timertable, string)) {
			this.warn(`timer "${label}" already started`);
			return;
		}
		this.#timertable[string] = Date.now();
	}
	timeLog(label: any, ...data: any[]) {
		const string = `${label}`;
		if (!hasOwn(this.#timertable, string)) this.time(string);
		const startTime = this.#timertable[string];
		const duration = Date.now() - startTime;
		const concat = `${label}: ${duration}ms`;
		this.#printer('timeLog', [concat, ...data]);
	}
	timeEnd(label: any) {
		const string = `${label}`;
		const startTime = this.#timertable[string] || Date.now();
		delete this.#timertable[string];
		const duration = Date.now() - startTime;
		const concat = `${label}: ${duration}ms`;
		this.#printer('timeEnd', [concat]);
	}
	static splitOutput(out: Writers) {
		return createSplitPrinter(out);
	}
	static output(out: WriteFunction, colors?: Partial<ColorScheme>) {
		return createTextPrinter(out, colors);
	}
}
