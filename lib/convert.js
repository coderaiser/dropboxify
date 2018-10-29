'use strict';

const parse = require('date-fns/parse');

module.exports = (type, file) => {
    if (file['.tag'] === 'folder')
        return {
            name: file.name,
            size: 0,
            date: 0,
            mode: '',
            owner: '',
            type: 'directory',
        };
    
    return {
        name: file.name,
        size: file.size,
        date: getDate(type, file.server_modified),
        mode: '',
        owner: '',
        type: 'file'
    }
}

function getDate(type, date) {
    const parsed = parse(date);
   
    if (type === 'raw')
        return Number(parsed);
    
    return parsed;
}

