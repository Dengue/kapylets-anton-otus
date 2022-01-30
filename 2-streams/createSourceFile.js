const fs = require("fs");

const { getRandomInt, prepareIntForWriting, getActualBytesOfString } = require("./utils");
const { MAX_FILE_SIZE_IN_BYTES, FILE_DELIMETER, NUMBER_OF_CHUNKS, SOURCE_FILENAME } = require("./constants");

const adjustChunkSize = (chunk, desiredChunkSize) => {
  while (getActualBytesOfString(chunk) > desiredChunkSize) {
    chunk = chunk.slice(0, -1);
  }
  chunk = chunk.slice(0, -1);
  chunk += FILE_DELIMETER;
  return chunk;
}

const writeChunk = (sourceFile) => {
  const numbersChunkLength = MAX_FILE_SIZE_IN_BYTES / NUMBER_OF_CHUNKS;
  return new Promise((resolve) => {
    let chunkSizeInBytes = 0;
    let numbersChunk = "";
    while (chunkSizeInBytes < numbersChunkLength) {
      let nextNumber = getRandomInt(0, 1000000);
      nextNumber = prepareIntForWriting(nextNumber);
      const nextNumberWithDelimeter = nextNumber + FILE_DELIMETER;
      const bytesToBeWritten = getActualBytesOfString(nextNumberWithDelimeter);
      numbersChunk += nextNumberWithDelimeter;
      chunkSizeInBytes += bytesToBeWritten;
    }
    numbersChunk = adjustChunkSize(numbersChunk, numbersChunkLength);

    sourceFile.write(numbersChunk, (err) => {
      if (err) {
        console.error(err);
        process.exit(1);
      };
      resolve(numbersChunkLength);
    });
  });
}


const createSourceFile = async () => {
  const sourceFile = fs.createWriteStream(SOURCE_FILENAME);
  let bytesWritten = 0;
  while (bytesWritten < MAX_FILE_SIZE_IN_BYTES) {
    const numbersChunkLength = await writeChunk(sourceFile);
    bytesWritten += numbersChunkLength;
  }
  sourceFile.close();
}

exports.createSourceFile = createSourceFile;