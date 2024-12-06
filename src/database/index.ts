import Database from 'better-sqlite3';
import * as path from 'path';
 
const db = new Database(path.resolve(__dirname, './mcpdict.db'), { 
  verbose: console.log
});
 

export default db;