import db from "../database";
import { JC, YDYS } from "../utils/constant";

// 中间件用于检查是否需要初始化会话数据
export function dialectMiddleware(req, res, next) {
  if (!req.session.dialectInfos) {
    // 如果会话未初始化，则查询数据库并设置会话数据
    const sqlStr = `SELECT * FROM info`;
    const stmt = db.prepare(sqlStr);
    const rows = stmt.all();

    const dialectInfos = rows.filter(ele => ele[YDYS]);
    req.session.dialectInfos = dialectInfos
    req.session.dialectNames = dialectInfos.map(ele => ele[JC])
    req.session.save(); // 立即保存会话
    next();
  } else {
    // 如果会话已经初始化，直接跳过此步骤
    next();
  }
}