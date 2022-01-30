const fs = require("fs");

const { FILE_DELIMETER, FOLDER_FOR_INTERMEDIATE_FILES } = require("./constants");

const asyncWriteFile = (fileName) => {
  const tempFile = fs.createWriteStream(fileName);
  return {
    write: (data) => {
      return new Promise((resolve, reject) => {
        tempFile.write(data.join(FILE_DELIMETER) + FILE_DELIMETER, (err) => {
          if(err) {
            reject()
            return
          }
          resolve();
        })
      })
    }
  }
}

const fileChunksProducer = (fileName) => {
  let isStreamEnded = false;
  let resolveRef = null;
  const readable = fs.createReadStream(fileName, { encoding: 'utf-8' });
  readable.pause();
  let partFromPrevChunk = '';
  readable.on("data", (chunk) => {
    let nextChunk = partFromPrevChunk + chunk;
    partFromPrevChunk = '';
    if (!nextChunk.endsWith(FILE_DELIMETER)) {
      const lastNumberEndIndex = nextChunk.lastIndexOf(FILE_DELIMETER);
      partFromPrevChunk = nextChunk.slice(lastNumberEndIndex - nextChunk.length);
      nextChunk = nextChunk.slice(0, lastNumberEndIndex);
    }
    readable.pause();
    resolveRef?.(nextChunk.trim().split(FILE_DELIMETER).filter(numberString => numberString).map(number => +number));
  });
  readable.on("end", () => {
    resolveRef?.(partFromPrevChunk.trim().split(FILE_DELIMETER).filter(numberString => numberString).map(number => +number));
    isStreamEnded = true;
  })
  return {
    getNextChunk: () => {
      return new Promise((resolve) => {
        if (isStreamEnded) {
          resolve(null);
        }
        resolveRef = resolve;
        readable.resume();

      });
    }
  }
}

const joinSortedFiles = async (fileNames, resultFileName) => {
  const allProducers = fileNames.map((fileName) => fileChunksProducer(`${FOLDER_FOR_INTERMEDIATE_FILES}/${fileName}`));
  const allChunks = [];
  for(let i = 0; i < allProducers.length; i++) {
    allChunks.push(await allProducers[i].getNextChunk());
  }

  const resultFile = asyncWriteFile(resultFileName);
  let bufferToWrite = [];
  while (true) {
    const minValuesInChunks = allChunks.map((chunk) => chunk.length > 0 ? chunk[0] : Infinity);
    const minValueIndex = minValuesInChunks.indexOf(Math.min(...minValuesInChunks));
    bufferToWrite.push(allChunks[minValueIndex].shift());
    if(allChunks[minValueIndex].length === 0) {
      const nextChunk = await allProducers[minValueIndex].getNextChunk();
      if(nextChunk) {
        allChunks[minValueIndex] = nextChunk;
      }
    }
    if (bufferToWrite.length === 1000) { // write 1000 numbers at once
      await resultFile.write(bufferToWrite);
      bufferToWrite = [];
    }
    if (allChunks.every(chunk => chunk.length === 0)) {
      if (bufferToWrite.length) {
        await resultFile.write(bufferToWrite);
      }
      break;
    }
  }
}

exports.joinSortedFiles = joinSortedFiles;