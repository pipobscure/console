import type { PrinterFunction, LogLevel } from './main';

export type Writers = { [k in LogLevel]: PrinterFunction<any> };

class SplitPrinter {
	#print: Writers;
	constructor(writers: Writers) {
		this.#print = writers;
		this.print = this.print.bind(this);
	}
	print(level: LogLevel, data: any[], opts?: any) {
		const print = this.#print[level];
		if ('function' !== typeof print) return;
		print(level, data, opts);
	}
}

export default function (out: Writers) {
	return new SplitPrinter(out).print;
}
