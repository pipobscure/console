import typescript from 'rollup-plugin-typescript2';

export default {
	input: 'lib/console.ts',
	output: {
		dir: './dist',
		format: 'esm',
		sourcemap: false,
	},
	plugins: [
		typescript({
			tsconfigOverride: {
				compilerOptions: { module: 'ESNext' },
			},
		}),
	],
};
