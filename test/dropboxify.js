'use strict';

const mockRequire = require('mock-require');

const {test, stub} = require('supertape');
const dropboxify = require('..');
const tryToCatch = require('try-to-catch');
const {stopAll, reRequire} = mockRequire;

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
    
    mockRequire('dropbox', {
        Dropbox,
    });
    
    const dropboxify = reRequire('..');
    await dropboxify('token', path);
    stopAll();
    t.calledWith(filesListFolder, [{
        path: '',
    }], 'should call with empty path');
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
    
    mockRequire('dropbox', {
        Dropbox,
    });
    
    const dropboxify = reRequire('..');
    await dropboxify('token', path);
    stopAll();
    t.calledWith(filesListFolder, [{
        path,
    }], 'should call with empty path');
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
    
    mockRequire('dropbox', {
        Dropbox,
    });
    
    const dropboxify = reRequire('..');
    const result = await dropboxify(token, path);
    
    stopAll();
    
    t.deepEqual(result, fixture.output);
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
    
    mockRequire('dropbox', {
        Dropbox,
    });
    
    const dropboxify = reRequire('..');
    
    const result = await dropboxify(token, path, {
        type: 'raw',
    });
    
    stopAll();
    
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
    
    mockRequire('dropbox', {
        Dropbox,
    });
    
    const dropboxify = reRequire('..');
    const [e] = await tryToCatch(dropboxify, 'token', path);
    
    stopAll();
    
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
    
    mockRequire('dropbox', {
        Dropbox,
    });
    
    const dropboxify = reRequire('..');
    const [e] = await tryToCatch(dropboxify, 'token', path);
    
    stopAll();
    
    t.deepEqual(e, error, 'should reject');
    t.end();
});
