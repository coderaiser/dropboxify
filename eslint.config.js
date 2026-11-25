import {defineConfig} from 'eslint/config';
import {safeAlign} from 'eslint-plugin-putout';

export default defineConfig([
    safeAlign, {
        rules: {
            'n/no-unsupported-features/node-builtins': 'off',
        },
    },
]);
