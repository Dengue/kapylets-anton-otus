const fs = require("fs");
const util = require('util');

const readdir = util.promisify(fs.readdir);
const rm = util.promisify(fs.rm);

const { FOLDER_FOR_INTERMEDIATE_FILES } = require("./constants");
const { createSourceFile } = require("./createSourceFile");
const { createIntermediateSortedFiles } = require("./createIntermediateSortedFiles");
const { joinSortedFiles } = require("./joinSortedFiles");

const sortLargeFile = async () => {
  await createSourceFile();
  await createIntermediateSortedFiles();
  const tempFiles = await readdir(FOLDER_FOR_INTERMEDIATE_FILES);
  await joinSortedFiles(tempFiles, 'final.txt');
  await rm(FOLDER_FOR_INTERMEDIATE_FILES, { recursive: true, force: true })
}

sortLargeFile();


