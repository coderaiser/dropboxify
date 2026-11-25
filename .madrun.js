import {run} from 'madrun';

export default {
    'test': () => `tape 'test/*.js'`,
    'report': () => 'c8 report --reporter=lcov',
    'coverage': () => 'c8 npm test',
    'watch:coverage': () => run('watcher', 'npm run coverage'),
    'watch:test': () => run('watcher', 'npm test'),
    'watcher': () => 'nodemon -w test -w lib --exec',
    'lint': () => 'putout .',
    'fix:lint': () => run('lint', '--fix'),
};
