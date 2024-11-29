const { extractHanzi } = require("@vearvip/hanzi-utils");
const db = require("../database/index");
const { HZ, VA } = require("../utils/constant");

// 查询多个字符的信息
function queryChars(charList) { 
  const placeholders = charList.map(() => '?').join(', ');
  const sqlStr = `SELECT * FROM mcpdict WHERE ${HZ} IN (${placeholders})`;
  const stmt = db.prepare(sqlStr);
  const rows = stmt.all(charList);
  return rows;
}

// 查询多个字符的变体
function queryVariants(charStr = '') {
  console.log({charStr})
  const charList = extractHanzi(charStr); // 提取字符串中的汉字
  const placeholders = charList.map(() => '?').join(', ');
  const sqlStr = `SELECT ${HZ}, ${VA} FROM mcpdict WHERE ${HZ} IN (${placeholders})`;
  const stmt = db.prepare(sqlStr);
  const rows = stmt.all(charList);

  // 初始化变体数组
  const variants = [];

  // 遍历查询结果，将每个字符及其变体添加到变体数组中
  rows.forEach(row => {
    variants.push(row[HZ]); // 添加当前字符
    if (typeof row[VA] === 'string') {
      variants.push(...row[VA].split(' ')); // 添加变体
    }
  });

  return variants;
}

module.exports = {
  queryChars,
  queryVariants
};