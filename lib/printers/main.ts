export type LogLevel = 'trace' | 'dir' | 'count' | 'countReset' | 'group' | 'groupCollapsed' | 'groupEnd' | 'timeLog' | 'timeEnd' | 'assert' | 'debug' | 'log' | 'info' | 'warn' | 'error';
export interface PrinterFunction<T> {
	(level: LogLevel, args: any[], opts?: T): void;
}
export interface WriteFunction {
	(data: string): void;
}

import createTextPrinter from './text';
import createSplitPrinter from './split';
export { createSplitPrinter, createTextPrinter };

export type { ColorScheme } from './text';
export type { Writers } from './split';
