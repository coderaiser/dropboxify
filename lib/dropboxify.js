'use strict';

const {Dropbox} = require('dropbox');
const currify = require('currify');
const convert = currify(require('./convert'));

const sortify = currify(require('@cloudcmd/sortify'));
const formatify = require('@cloudcmd/formatify');
const fetch = require('node-fetch');

const ifRaw = currify(_ifRaw);
const addPath = currify(_addPath);

const getEntries = (a) => a.entries;
const map = currify((fn, a) => a.map(fn));

module.exports = async (accessToken, dir, options = {}) => {
    check(accessToken, dir);
    
    const type = options.type;
    const order = options.order;
    const sort = options.sort || 'name';
    
    checkType(type);
    checkSort(sort, order);
    
    const path = getPath(dir);
    const dbx = new Dropbox({
        accessToken,
        fetch,
    });
    
    return dbx.filesListFolder({path})
        .then(getEntries)
        .then(map(convert(type)))
        .then(sortify({sort, order}))
        .then(ifRaw(type, formatify))
        .then(addPath(dir))
        .catch(getError)
};

function _addPath(path, files) {
    return {
        path,
        files,
    }
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
    if (typeof token !== 'string')
        throw Error('accessToken should be a string!');
    
    if (typeof dir !== 'string')
        throw Error('dir should be a string!');
}

function checkSort(sort, order) {
    if (sort && typeof sort !== 'string')
        throw Error('sort should be a string!');
    
    if (order && !/^(asc|desc)$/.test(order))
        throw Error('order can be "asc" or "desc" only!');
}

function checkType(type) {
    if (type && typeof type !== 'string')
        throw Error('type should be a string or not to be defined!');
}

