import { AppError } from "../errors";

/**
 * FTS5 的字符串值统一用双引号包成 phrase，内部双引号再转义。
 * 这样 `OR`、`*`、括号、单引号等都不会被当成 FTS 语法。
 */
export function quoteFtsValue(value: string): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (!normalized) {
    throw new AppError(400, "EMPTY_FTS_VALUE", "查询内容不能为空");
  }
  return `"${normalized.replaceAll('"', '""')}"`;
}

export function columnMatch(column: string, values: string[]): string {
  const unique = [...new Set(values.map((value) => value.trim()).filter(Boolean))];
  if (unique.length === 0) {
    throw new AppError(400, "EMPTY_FTS_VALUE", "查询内容不能为空");
  }
  return `${column} : (${unique.map(quoteFtsValue).join(" OR ")})`;
}

export function prefixQuery(input: string): string {
  const normalized = input.replace(/\s+/g, " ").trim();
  if (!normalized) {
    throw new AppError(400, "EMPTY_FTS_VALUE", "查询内容不能为空");
  }
  return normalized
    .split(" ")
    .filter(Boolean)
    .map((token) => `${quoteFtsValue(token)}*`)
    .join(" ");
}
