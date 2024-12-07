import db from "../database";
import { JC, YDYS } from "../utils/constant";

// 中间件用于检查是否需要初始化会话数据
 
export function dialectMiddleware(req, res, next) {
  if (!req.app.locals.dialectInfos) { 
    const sqlStr = `SELECT * FROM info`;
    const stmt = db.prepare(sqlStr);
    const rows = stmt.all();

    const dialectInfos = rows.filter(ele => ele[YDYS]);
    req.app.locals.dialectInfos = dialectInfos
    req.app.locals.dialectNames = dialectInfos.map(ele => ele[JC])  
    next();
  } else {
    // 如果会话已经初始化，直接跳过此步骤
    next();
  }
}