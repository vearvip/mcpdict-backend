const Database = require('better-sqlite3');
const path =require('path')
const db = new Database(path.resolve(__dirname, './mcpdict.db'), { verbose: console.log });

module.exports = db