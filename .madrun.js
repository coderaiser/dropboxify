'use strict';

const {run} = require('madrun');

module.exports = {
    'test': () => `tape 'test/*.js'`,
    'report': () => 'c8 report --reporter=text-lcov | coveralls',
    'coverage': () => 'c8 npm test',
    'watch:coverage': () => run('watcher', 'npm run coverage'),
    'watch:test': () => run('watcher', 'npm test'),
    'watcher': () => 'nodemon -w test -w lib --exec',
    'lint': () => 'putout .',
    'fix:lint': () => run('lint', '--fix'),
};
