'use strict';

const test = require('tape');
const dropboxify = require('..');
const diff = require('sinon-called-with-diff');
const sinon = diff(require('sinon'));
const noop = sinon.stub();

const fixture = {
    input: require('./fixture/input'),
    output: require('./fixture/output'),
    outputRaw: require('./fixture/output-raw'),
};

test('dropboxify: no accessToken', (t) => {
    t.throws(dropboxify, /accessToken should be a string!/, 'should throw when no accessToken');
    t.end();
});

test('dropboxify: no dir', (t) => {
    const fn = () => dropboxify('');
    
    t.throws(fn, /dir should be a string!/, 'should throw when no dir');
    t.end();
});

test('dropboxify: no fn', (t) => {
    const fn = () => dropboxify('', '');
    
    t.throws(fn, /fn should be a function!/, 'should throw when no fn');
    t.end();
});

test('dropboxify: options: wrong type', (t) => {
    const fn = () => dropboxify('token', '/', {type: 1}, noop);
    t.throws(fn, /type should be a string or not to be defined!/, 'should when type not string');
    t.end();
});

test('dropboxify: options: wrong sort', (t) => {
    const fn = () => dropboxify('token', '/', {sort: 1}, noop);
    t.throws(fn, /sort should be a string!/, 'should when sort not string');
    t.end();
});

test('dropboxify: options: wrong sort', (t) => {
    const fn = () => dropboxify('token', '/', {order: 1}, noop);
    t.throws(fn, /order can be "asc" or "desc" only!/, 'should when sort not string');
    t.end();
});

test('dropboxify: call: root', (t) => {
    const path = '/';
    const filesListFolder = sinon
        .stub()
        .returns(Promise.resolve());
    
    const Dropbox = function() {
        this.filesListFolder = filesListFolder;
    };
    
    clean('..');
    
    stub('dropbox', {
        Dropbox
    });
    
    const dropboxify = require('..');
    dropboxify('token', path, sinon.stub());
    
    t.ok(filesListFolder.calledWith({path: ''}), 'should call with empty path');
    t.end();
});

test('dropboxify: call: not root', (t) => {
    const path = '/home';
    const filesListFolder = sinon
        .stub()
        .returns(Promise.resolve());
    
    const Dropbox = function() {
        this.filesListFolder = filesListFolder;
    };
    
    clean('..');
    
    stub('dropbox', {
        Dropbox
    });
    
    const dropboxify = require('..');
    dropboxify('token', path, sinon.stub());
    
    t.ok(filesListFolder.calledWith({path}), 'should call with empty path');
    t.end();
});

test('dropboxify: result', (t) => {
    const token = 'token';
    const path = '/home';
    const filesListFolder = sinon
        .stub()
        .returns(Promise.resolve({
            entries: fixture.input
        }));
    
    const Dropbox = function() {
        this.filesListFolder = filesListFolder;
    };
    
    clean('..');
    
    stub('dropbox', {
        Dropbox
    });
    
    const dropboxify = require('..');
    dropboxify(token, path, (e, result) => {
        t.deepEqual(result, fixture.output, 'should equal');
        t.end();
    });
});

test('dropboxify: result: raw', (t) => {
    const token = 'token';
    const path = '/home';
    const filesListFolder = sinon
        .stub()
        .returns(Promise.resolve({
            entries: fixture.input
        }));
    
    const Dropbox = function() {
        this.filesListFolder = filesListFolder;
    };
    
    clean('..');
    
    stub('dropbox', {
        Dropbox
    });
    
    const dropboxify = require('..');
    dropboxify(token, path, {type: 'raw'}, (e, result) => {
        t.deepEqual(result, fixture.outputRaw, 'should equal');
        t.end();
    });
});

test('dropboxify: error: wrong token', (t) => {
    const path = '/home';
    const msg = [
        'Error in call to API function "files/list_folder":',
        'Invalid authorization value in HTTP header "Authorization": "Bearer".',
        'Expecting "Bearer <oauth2-access-token>"',
    ].join('');
    
    const error = Error(msg);
    
    const promise = new Promise((resolve, reject) => {
        reject({
            error: msg
        });
    });
    
    const filesListFolder = sinon
        .stub()
        .returns(promise);
    
    const Dropbox = function() {
        this.filesListFolder = filesListFolder;
    };
    
    clean('..');
    
    stub('dropbox', {
        Dropbox
    });
    
    const dropboxify = require('..');
    dropboxify('token', path, (e) => {
        t.deepEqual(e, error, 'should reject');
        t.end();
    });
});

test('dropboxify: error: wrong dir', (t) => {
    const path = '/home';
    const error_summary = 'path/not_found/..';
    
    const error = Error(error_summary);
    const promise = new Promise((resolve, reject) => {
        reject({
            error: {
                error_summary
            }
        });
    });
    
    const filesListFolder = sinon
        .stub()
        .returns(promise);
    
    const Dropbox = function() {
        this.filesListFolder = filesListFolder;
    };
    
    clean('..');
    
    stub('dropbox', {
        Dropbox
    });
    
    const dropboxify = require('..');
    dropboxify('token', path, (e) => {
        t.deepEqual(e, error, 'should reject');
        t.end();
    });
});

function clean(path) {
    delete require.cache[require.resolve(path)];
}

function stub(name, fn) {
    require.cache[require.resolve(name)].exports = fn;
}

