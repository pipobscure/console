import { describe, it, beforeEach } from '@xutl/test';
import assert from 'assert';

import { createCache } from '../utils';
import createText from './text';

describe('plain', () => {
	const result = createCache();
	const plain = createText(result);
	beforeEach(result.clear);
	it('log', () => {
		plain('log', ['one', 'two', 3, true]);
		assert(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\s\[LOG\]\sone\stwo\s3\strue\n$/m.test(result.data));
	});
	it('error', () => {
		plain('error', ['one', 'two', 3, Symbol('name')]);
		assert(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\s\[ERROR\]\sone\stwo\s3\sSymbol\(name\)\n$/m.test(result.data));
	});
	describe('multi', () => {
		beforeEach(() => result.clear());
		it('error', () => {
			plain('log', ['message', new Error('testerror')]);
			assert(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\s\[LOG\]\smessage\n\tError:\stesterror\n(?:\s+at\s.*?\n)*$/m.test(result.data));
		});
		it('array', () => {
			plain('log', ['message', [1, 2, 3]]);
			assert(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\s\[LOG\]\smessage\n\t\[\n\t\t1,\n\t\t2,\n\t\t3\n\t]\n$/m.test(result.data));
		});
		it('object', () => {
			const o: any = {};
			o.x = { o, l: 1 };
			plain('log', ['message', { a: o, b: true }]);
			assert(
				/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\s\[LOG\]\smessage\n\t{\n\t\ta:\s{\n\t\t\tx:\s{\n\t\t\t\to:\s<circular>,\n\t\t\t\tl:\s1\n\t\t\t}\n\t\t},\n\t\tb:\strue\n\t}\n$/m.test(result.data),
			);
		});
	});
});
