'use strict';
const fse = require('fs-extra');

const INDEX_DIR = 'dist/';
const INDEX_FILE = INDEX_DIR + 'index.html';

const changePath = (file) => {
    let strings = fse.readFileSync(file).toString();
    strings = strings.replace(/\/css/gi, './static/css');
    strings = strings.replace(/\/js/gi, './static/js');
    strings = strings.replace(/static\/libs/gi, './static/libs');
    
    fse.writeFileSync(file, strings);
}

const directoryExists = (path) => {
    try {
        return fse.statSync(path).isDirectory();
    } catch (e) {
        return false;
    }
}

const fileExists = (path) => {
    try {
        return fse.statSync(path).isFile();
    } catch (e) {
        return false;
    }
}

if (directoryExists(INDEX_DIR) && fileExists(INDEX_FILE)) {
    changePath(INDEX_FILE);
}
