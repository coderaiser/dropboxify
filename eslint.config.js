'use strict';

const {safeAlign} = require('eslint-plugin-putout/config');

module.exports = [
    ...safeAlign, {
        rules: {
            'n/no-unsupported-features/node-builtins': 'off',
        },
    },
];
