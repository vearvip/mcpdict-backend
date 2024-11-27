import { dbClient } from "../database";
import { HZ } from "../utils/constant";

export function queryChars(charList: string[]) {
  const placeholders = charList.map(char => `'${char}'`).join(', ')
  console.log('placeholders', placeholders)
  const sqlStr = `SELECT * FROM mcpdict where ${HZ} IN (${placeholders}) LIMIT 1`
  console.log('sqlStr', sqlStr)
  const rows = dbClient.query(sqlStr).all(); 
  return rows
}


