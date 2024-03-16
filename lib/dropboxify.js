'use strict';

const {Dropbox} = require('dropbox');
const currify = require('currify');

const formatify = require('@cloudcmd/formatify');
const isString = (a) => typeof a === 'string';
const {defineProperty} = Object;
const sortify = currify(require('@cloudcmd/sortify'));
const convert = currify(require('./convert'));
const ifRaw = currify(_ifRaw);
const addPath = currify(_addPath);

const getEntries = (a) => a.entries;
const map = currify((fn, a) => a.map(fn));

const customFetch = async (url, options) => {
    const response = await fetch(url, options);
    
    return defineProperty(response, 'buffer', {
        value: response.arrayBuffer,
    });
};

module.exports = (accessToken, dir, options = {}) => {
    check(accessToken, dir);
    
    const {
        type,
        order,
        sort = 'name',
    } = options;
    
    checkType(type);
    checkSort(sort, order);
    
    const path = getPath(dir);
    const dbx = new Dropbox({
        accessToken,
        fetch: customFetch,
    });
    
    return dbx
        .filesListFolder({
            path,
        })
        .then(getEntries)
        .then(map(convert(type)))
        .then(sortify({
            sort,
            order,
        }))
        .then(ifRaw(type, formatify))
        .then(addPath(dir))
        .catch(getError);
};

function _addPath(path, files) {
    return {
        path,
        files,
    };
}

function _ifRaw(type, fn, a) {
    if (type === 'raw')
        return a;
    
    return fn(a);
}

const getError = (a) => {
    if (a.error.error_summary)
        throw Error(a.error.error_summary);
    
    throw Error(a.error);
};

const getPath = (path) => {
    if (path === '/')
        return '';
    
    return path;
};

function check(token, dir) {
    if (!isString(token))
        throw Error('accessToken should be a string!');
    
    if (!isString(dir))
        throw Error('dir should be a string!');
}

function checkSort(sort, order) {
    if (sort && !isString(sort))
        throw Error('sort should be a string!');
    
    if (order && !/^(asc|desc)$/.test(order))
        throw Error('order can be "asc" or "desc" only!');
}

function checkType(type) {
    if (type && !isString(type))
        throw Error('type should be a string or not to be defined!');
}
