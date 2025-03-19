// @ts-ignore
import dbClient from "../src/database/mcpdict.db" with { "type": "sqlite" };
import { Database } from "bun:sqlite";
import { HanZi, JianCheng, YinDianFenQv, YinDianYanSe } from "../src/utils/constant";
import path from "path";

// 预编译正则表达式
const REGEX_CLEAN = /{[^}]*}|\t/g;
const REGEX_EXTRACT = /{([^}]*)}/g;

// 预处理阶段
console.time("1️⃣ 数据读取");
const infoData = dbClient.query(`SELECT * FROM info`).all();
const mcpdictData = dbClient.query(`SELECT * FROM mcpdict`).all();
console.timeEnd("1️⃣ 数据读取");

// 方言预处理
const dialectMap = new Map();
const validDialects: { jianCheng: string; columnName: string }[] = [];

for (const dialect of infoData) {
  if (dialect[YinDianFenQv] !== "歷史音" && dialect[YinDianYanSe]) {
    const columnName = `\`${dialect[JianCheng]}\``;
    dialectMap.set(dialect[JianCheng], dialect);
    validDialects.push({ jianCheng: dialect[JianCheng], columnName });
  }
}

// 数据处理
console.time("2️⃣ 数据处理");
const ipaList: any[] = [];
const explainList: any[] = [];
ipaList.length = mcpdictData.length;
explainList.length = mcpdictData.length;

for (let i = 0; i < mcpdictData.length; i++) {
  const item = mcpdictData[i];
  const ipaItem: any = { [HanZi]: item[HanZi] };
  const explainItem: any = { [HanZi]: item[HanZi] };

  for (const { jianCheng, columnName } of validDialects) {
    const value = item[jianCheng];
    if (!value) continue;

    // 处理IPA
    ipaItem[columnName] = value.replace(REGEX_CLEAN, (m: string) =>
      m === "\t" ? "|" : ""
    );

    // 处理解释
    let matches;
    const extracted: string[] = [];
    while ((matches = REGEX_EXTRACT.exec(value)) !== null) {
      extracted.push(matches[1]);
    }
    explainItem[columnName] = extracted.join("|");
    REGEX_EXTRACT.lastIndex = 0;
  }

  ipaList[i] = ipaItem;
  explainList[i] = explainItem;
}
console.timeEnd("2️⃣ 数据处理");

// 数据库初始化
console.time("3️⃣ 数据库初始化");
const subDbClient = new Database(
  path.resolve(import.meta.dir, "../src/database/sub_mcpdict.db"),
  {
    readonly: false,
    create: true
  }
);

subDbClient.exec(`
  PRAGMA journal_mode = MEMORY;
  PRAGMA synchronous = OFF;
  PRAGMA locking_mode = EXCLUSIVE;
  PRAGMA temp_store = MEMORY;
  PRAGMA cache_size = -100000;
`);

// 创建虚拟表（新增 info 和 mcpdict 表）
const createVirtualTable = (table: string, columns: string[]) => {
  subDbClient.exec(`DROP TABLE IF EXISTS ${table}`);
  subDbClient.exec(
    `CREATE VIRTUAL TABLE ${table} USING fts5(${columns.join(", ")})`
  );
};

// 动态获取列名并包裹反引号
const getWrappedColumns = (data: any[]) => 
  Object.keys(data[0] || {}).map(col => `\`${col}\``);

createVirtualTable("info", getWrappedColumns(infoData));
createVirtualTable("mcpdict", getWrappedColumns(mcpdictData));

const ipaColumns = [HanZi, ...validDialects.map((d) => d.columnName)];
createVirtualTable("ipa", ipaColumns);
createVirtualTable("explain", ipaColumns);
console.timeEnd("3️⃣ 数据库初始化");

// 修复后的批量插入方法
console.time("4️⃣ 数据插入");
const optimizedInsert = async (table: string, columns: string[], data: any[]) => {
  const CHUNK_SIZE = 2000;
  const insert = subDbClient.prepare(
    `INSERT INTO ${table} (${columns.join(",")}) VALUES ` +
    `(${columns.map(() => "?").join(",")})`
  );

  for (let i = 0; i < data.length; i += CHUNK_SIZE) {
    await subDbClient.transaction(() => {
      const chunk = data.slice(i, i + CHUNK_SIZE);
      for (const row of chunk) {
        const values = columns.map(col => {
          // 移除列名反引号以匹配原始数据键
          const rawKey = col.replace(/`/g, '');
          return row[rawKey] ?? '';
        });
        insert.run(...values);
      }
    })();
  }
};

// 插入所有表数据
await Promise.all([
  optimizedInsert("info", getWrappedColumns(infoData), infoData),
  optimizedInsert("mcpdict", getWrappedColumns(mcpdictData), mcpdictData),
  optimizedInsert("ipa", ipaColumns, ipaList),
  optimizedInsert("explain", ipaColumns, explainList),
]);
console.timeEnd("4️⃣ 数据插入");

subDbClient.exec(`
  PRAGMA optimize;
  PRAGMA vacuum;
`);

console.log("✅ 所有操作已完成");
process.exit(0);