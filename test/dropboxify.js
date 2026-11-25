import {createRequire} from 'node:module';
import {test, stub} from 'supertape';
import {tryToCatch} from 'try-to-catch';
import {dropboxify} from '../lib/dropboxify.js';

const require = createRequire(import.meta.url);

const fixture = {
    input: require('./fixture/input'),
    output: require('./fixture/output'),
    outputRaw: require('./fixture/output-raw'),
};

test('dropboxify: no accessToken', async (t) => {
    const [e] = await tryToCatch(dropboxify);
    
    t.equal(e.message, 'accessToken should be a string!', 'should throw when no accessToken');
    t.end();
});

test('dropboxify: no dir', async (t) => {
    const [e] = await tryToCatch(dropboxify, '');
    
    t.equal(e.message, 'dir should be a string!', 'should throw when no dir');
    t.end();
});

test('dropboxify: options: wrong type', async (t) => {
    const [e] = await tryToCatch(dropboxify, 'token', '/', {
        type: 1,
    });
    
    t.equal(e.message, 'type should be a string or not to be defined!', 'should when type not string');
    t.end();
});

test('dropboxify: options: wrong sort', async (t) => {
    const [e] = await tryToCatch(dropboxify, 'token', '/', {
        sort: 1,
    });
    
    t.equal(e.message, 'sort should be a string!', 'should when sort not string');
    t.end();
});

test('dropboxify: options: wrong order', async (t) => {
    const [e] = await tryToCatch(dropboxify, 'token', '/', {
        order: 1,
    });
    
    t.equal(e.message, 'order can be "asc" or "desc" only!', 'should when sort not string');
    t.end();
});

test('dropboxify: call: root', async (t) => {
    const path = '/';
    const filesListFolder = stub().returns(Promise.resolve({
        entries: fixture.input,
    }));
    
    const Dropbox = function() {
        this.filesListFolder = filesListFolder;
    };
    
    await dropboxify('token', path, {
        Dropbox,
    });
    const args = [{
        path: '',
    }];
    
    t.calledWith(filesListFolder, args);
    t.end();
});

test('dropboxify: call: not root', async (t) => {
    const path = '/home';
    const filesListFolder = stub().returns(Promise.resolve({
        entries: fixture.input,
    }));
    
    const Dropbox = function() {
        this.filesListFolder = filesListFolder;
    };
    
    await dropboxify('token', path, {
        Dropbox,
    });
    const args = [{
        path,
    }];
    
    t.calledWith(filesListFolder, args);
    t.end();
});

test('dropboxify: result', async (t) => {
    const token = 'token';
    const path = '/';
    
    const filesListFolder = stub().returns(Promise.resolve({
        entries: fixture.input,
    }));
    
    const Dropbox = function() {
        this.filesListFolder = filesListFolder;
    };
    
    const result = await dropboxify(token, path, {
        Dropbox,
    });
    
    const [directory, file] = fixture.output.files;
    const time = getTime(fixture.input[1].server_modified);
    
    const expected = {
        ...fixture.output,
        files: [
            directory, {
                ...file,
                time,
            },
        ],
    };
    
    t.deepEqual(result, expected);
    t.end();
});

test('dropboxify: result: raw', async (t) => {
    const token = 'token';
    const path = '/';
    
    const filesListFolder = stub().returns(Promise.resolve({
        entries: fixture.input,
    }));
    
    const Dropbox = function() {
        this.filesListFolder = filesListFolder;
    };
    
    const result = await dropboxify(token, path, {
        type: 'raw',
        Dropbox,
    });
    
    t.deepEqual(result, fixture.outputRaw);
    t.end();
});

test('dropboxify: error: wrong token', async (t) => {
    const path = '/';
    const msg = [
        'Error in call to API function "files/list_folder":',
        'Invalid authorization value in HTTP header "Authorization": "Bearer".',
        'Expecting "Bearer <oauth2-access-token>"',
    ].join('');
    
    const error = Error(msg);
    
    const promise = new Promise((resolve, reject) => {
        reject({
            error: msg,
        });
    });
    
    const filesListFolder = stub().returns(promise);
    
    const Dropbox = function() {
        this.filesListFolder = filesListFolder;
    };
    
    const [e] = await tryToCatch(dropboxify, 'token', path, {
        Dropbox,
    });
    
    t.deepEqual(e, error, 'should reject');
    t.end();
});

test('dropboxify: error: wrong dir', async (t) => {
    const path = '/';
    const error_summary = 'path/not_found/..';
    
    const error = Error(error_summary);
    const promise = new Promise((resolve, reject) => {
        reject({
            error: {
                error_summary,
            },
        });
    });
    
    const filesListFolder = stub().returns(promise);
    
    const Dropbox = function() {
        this.filesListFolder = filesListFolder;
    };
    
    const [e] = await tryToCatch(dropboxify, 'token', path, {
        Dropbox,
    });
    
    t.deepEqual(e, error, 'should reject');
    t.end();
});

test('dropboxify: sort: time', async (t) => {
    const Dropbox = getDropbox();
    
    const {files} = await dropboxify('token', '/', {
        sort: 'time',
        Dropbox,
    });
    
    const result = [];
    
    for (const {name} of files) {
        result.push(name);
    }
    
    const expected = [
        'z-early.txt',
        'a-late.txt',
    ];
    
    t.deepEqual(result, expected);
    t.end();
});

test('dropboxify: sort: time: desc', async (t) => {
    const Dropbox = getDropbox();
    
    const {files} = await dropboxify('token', '/', {
        sort: 'time',
        order: 'desc',
        Dropbox,
    });
    
    const result = [];
    
    for (const {name} of files) {
        result.push(name);
    }
    
    const expected = [
        'a-late.txt',
        'z-early.txt',
    ];
    
    t.deepEqual(result, expected);
    t.end();
});

test('dropboxify: sort: time: formatted time', async (t) => {
    const Dropbox = getDropbox();
    
    const {files} = await dropboxify('token', '/', {
        sort: 'time',
        Dropbox,
    });
    
    const result = [];
    
    for (const {time} of files) {
        result.push(time);
    }
    
    const expected = [
        getTime('2020-01-01T08:00:00Z'),
        getTime('2020-01-01T18:00:00Z'),
    ];
    
    t.deepEqual(result, expected);
    t.end();
});

function getTime(date) {
    return new Date(date)
        .toTimeString()
        .slice(0, 8);
}

function getDropbox() {
    const entries = [{
        '.tag': 'file',
        'name': 'a-late.txt',
        'size': 1,
        'server_modified': '2020-01-01T18:00:00Z',
    }, {
        '.tag': 'file',
        'name': 'z-early.txt',
        'size': 1,
        'server_modified': '2020-01-01T08:00:00Z',
    }];
    
    const filesListFolder = stub().returns(Promise.resolve({
        entries,
    }));
    
    return function() {
        this.filesListFolder = filesListFolder;
    };
}

test('dropboxify: fetch: buffer', async (t) => {
    const arrayBuffer = stub().returns('buffer');
    const response = {
        arrayBuffer,
    };
    
    const {fetch} = globalThis;
    
    globalThis.fetch = stub().returns(Promise.resolve(response));
    
    let options;
    
    const Dropbox = function(a) {
        options = a;
        this.filesListFolder = stub().returns(Promise.resolve({
            entries: [],
        }));
    };
    
    await dropboxify('token', '/', {
        Dropbox,
    });
    
    const result = await options.fetch('https://example.com', {});
    
    globalThis.fetch = fetch;
    
    t.equal(result.buffer, arrayBuffer);
    t.end();
});
