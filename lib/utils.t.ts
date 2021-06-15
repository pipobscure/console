//@ts-ignore
import test from '@xutl/test';
//@ts-ignore
const { describe, it, beforeEach } = test;
//@ts-ignore
import assert from 'assert';

import type { LogLevel } from './printers/main.js';
import { hasOwn, createTrace, logger, formatter } from './utils.js';

describe('utils', () => {
	describe('hasOwn', () => {
		it(`hasOwn({ x: 1 }, 'x')`, () => assert(hasOwn({ x: 1 }, 'x')));
		it(`hasOwn({ x: 1 }, 'y')`, () => assert(!hasOwn({ x: 1 }, 'y')));
	});
	describe('createTrace', () => {
		const trace = () => createTrace();
		it('createTrace(1)', () => assert.strictEqual(typeof trace(), 'string'));
		it('createTrace(2)', () => assert(/utils\.t\.js:\d+:\d+$/.test(trace())));
	});
	describe('formatter', () => {
		const obj = {};
		it('string', () => assert.deepStrictEqual(formatter(['[%s]', 'test']), [`[test]`]));
		it('integer', () => assert.deepStrictEqual(formatter(['[%i]', 5.5]), [`[5]`]));
		it('digits', () => assert.deepStrictEqual(formatter(['[%d]', 6.5]), [`[6]`]));
		it('float', () => assert.deepStrictEqual(formatter(['[%f]', 8.3]), [`[8.3]`]));
		it('object - 1', () => assert.deepStrictEqual(formatter(['[%o]', 8.3]), [`[8.3]`]));
		it('object - 2', () => assert.deepStrictEqual(formatter(['[%o]', 'test']), [`[test]`]));
		it('object - 3', () => assert.deepStrictEqual(formatter(['[%o]', [1, 2, 3]]), [`[1,2,3]`]));
		it('object - 4', () => assert.deepStrictEqual(formatter(['[%o]', { x: 1 }]), [`[[object Object]]`]));
		it('Object - 1', () => assert.deepStrictEqual(formatter(['[%O]', 8.3]), [`[8.3]`]));
		it('Object - 2', () => assert.deepStrictEqual(formatter(['[%O]', 'test']), [`["test"]`]));
		it('Object - 3', () => assert.deepStrictEqual(formatter(['[%O]', [1, 2, 3]]), [`[[1,2,3]]`]));
		it('Object - 4', () => assert.deepStrictEqual(formatter(['[%O]', { x: 1 }]), [`[{"x":1}]`]));
		it('multi', () => assert.deepStrictEqual(formatter(['[%s]', 'test', 1, 'hallo', obj]), [`[test]`, 1, 'hallo', obj]));
	});
	describe('logger', () => {
		const result: { level?: LogLevel; args?: any[] } = {};
		const log = logger.bind((level: LogLevel, args: any[]) => {
			result.level = level;
			result.args = args;
		});
		it('simple', () => {
			log('log', ['simple', 1, true, {}]);
			assert.strictEqual(result.level, 'log');
			assert.deepStrictEqual(result.args, ['simple', 1, true, {}]);
		});
		it('format - 1', () => {
			log('log', ['[%s]', 'simple', 1, true, {}]);
			assert.strictEqual(result.level, 'log');
			assert.deepStrictEqual(result.args, ['[simple]', 1, true, {}]);
		});
		it('format - 2', () => {
			log('log', ['[%O]', 'simple', 1, true, {}]);
			assert.strictEqual(result.level, 'log');
			assert.deepStrictEqual(result.args, ['["simple"]', 1, true, {}]);
		});
	});
});
