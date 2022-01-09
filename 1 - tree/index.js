const util = require('util');
const fs = require('fs');
const path = require('path');
const yargs = require('yargs');
const { exit } = require('process');

const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);

const VERTICAL_LINE = "|"
const HORIZONTAL_LINE = " —— ——"

const prepareParams = () => {
  const args = yargs(process.argv.slice(2)).argv;
  if(args._.length === 0) {
    console.info('Path to folder is required, please use command in format: tree <path> -d <depthCount>. -d is optional');
    exit(1);
  }
  return {
    path: args._[0],
    depth: args.d || 1,
  }
}

const printFoldersEntry = (entry, currentDepthLevel) => {
  const levelIndent = Array(7).join(' ');
  if (currentDepthLevel) {
    console.log(Array(currentDepthLevel + 1).join(levelIndent), VERTICAL_LINE);
    console.log(Array(currentDepthLevel + 1).join(levelIndent), HORIZONTAL_LINE, entry);
    return
  }
  console.log(VERTICAL_LINE);
  console.log(HORIZONTAL_LINE, entry);
}

const tree = async ({ rootPath, depth = 1, currentDepthLevel = 0 }) => {
  if (depth === currentDepthLevel) {
    return;
  }

  if (currentDepthLevel === 0) {
    console.log(rootPath);
  }

  try {
    const entries = await readdir(rootPath);
    for(let index = 0; index < entries.length; index++) {
      const entry = entries[index];
      printFoldersEntry(entry, currentDepthLevel);
      const entryFullPath = path.join(rootPath, entry);
      const entryStat = await stat(entryFullPath);
      if (entryStat.isDirectory()) {
        await tree({ rootPath: entryFullPath, depth, currentDepthLevel: currentDepthLevel + 1 })
      }
    }
  }
  catch(err) {
    console.error(`Error reading path:${rootPath}`);
    throw err;
  }
}

const { path: rootPath, depth } = prepareParams();
tree({ rootPath, depth });