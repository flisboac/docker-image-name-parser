import typescript from '@rollup/plugin-typescript';
import { resolve } from 'path';
import pkg from '../package.json';

export default {
    input: 'src/index.ts',
    output: {
        file: `../${pkg.browser}`,
        exports: 'named',
        format: 'umd',
        name: pkg.name,
        sourcemap: true,
    },
    plugins: [
        typescript({
            tsconfig: resolve(__dirname, 'tsconfig.browser.json')
        }),
    ]
};
