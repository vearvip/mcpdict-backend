// FTS 特殊字符转义（适用于 SQLite FTS5）
export const escapeFTSQuery = (input: string): string => {
  return input
    .replace(/["'():\[\]{}^~?\\/]/g, " ") // 替换特殊字符为空格
    .replace(/\s+/g, " ")                 // 合并连续空格
    .trim();
};
