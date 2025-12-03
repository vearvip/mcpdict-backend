import fs from 'fs'
import path from 'path'

function consoleDir() {
  function listFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const name = path.join(dir, file);
      if (fs.statSync(name).isDirectory()) {
        fileList = listFiles(name, fileList); // 递归调用自身来处理子目录
      } else {
        fileList.push(name);
      }
    });

    return fileList;
  }

  // 获取当前工作目录
  const currentDir = process.cwd();

  // 调用函数并打印结果
  const allFiles = listFiles(currentDir);
  allFiles.forEach(file => console.log(' --- ', file));

}


// FTS 特殊字符转义（适用于 SQLite FTS5）
export const escapeFTSQuery = (input: string): string => {
  return input
    .replace(/["'():\[\]{}^~?\\/]/g, " ") // 替换特殊字符为空格
    .replace(/\s+/g, " ")                 // 合并连续空格
    .trim();
};
