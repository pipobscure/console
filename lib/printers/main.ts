export type LogLevel = 'trace' | 'dir' | 'count' | 'countReset' | 'group' | 'groupCollapsed' | 'groupEnd' | 'timeLog' | 'timeEnd' | 'assert' | 'debug' | 'log' | 'info' | 'warn' | 'error';
export interface PrinterFunction<T> {
	(level: LogLevel, args: any[], opts?: T): void;
}
export interface WriteFunction {
	(data: string): void;
}

import createTextPrinter from './text.js';
import createSplitPrinter from './split.js';
import createMultiPrinter from './multi.js';
export { createTextPrinter, createSplitPrinter, createMultiPrinter };

export type { ColorScheme } from './text.js';
export type { Writers } from './split.js';
