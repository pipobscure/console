import type { PrinterFunction, LogLevel } from './main.js';

class MultiPrinter {
	#printers: PrinterFunction<any>[];
	constructor(printers: PrinterFunction<any>[]) {
		this.#printers = printers;
		this.print = this.print.bind(this);
	}
	print(level: LogLevel, data: any[], opts?: any) {
		for (const print of this.#printers) print(level, data, opts);
	}
}

export default function (out: PrinterFunction<any>[]) {
	return new MultiPrinter(out).print;
}
