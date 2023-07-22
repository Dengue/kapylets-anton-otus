const fs = require("fs");
const util = require('util');

const { getActualBytesOfString, stringToByteArray, byteArrayToString } = require("./utils");
const { MAX_FILE_SIZE_IN_BYTES, FILE_DELIMETER, SOURCE_FILENAME, FOLDER_FOR_INTERMEDIATE_FILES, NUMBER_OF_FILES } = require("./constants");

const mkdir = util.promisify(fs.mkdir);

const writeToFile = (file, data) => {
  return new Promise((resolve) => {
    file.write(data, (err) => {
      if (err) {
        console.error(err);
        process.exit(1);
      };
      resolve();
    });
  })
}

const createIntermediateSortedFiles = async () => {
  const sourceFile = fs.createReadStream(SOURCE_FILENAME, "binary");
  const bytesPerFile = MAX_FILE_SIZE_IN_BYTES / NUMBER_OF_FILES;
  let currentReadBytes = 0;
  let fileContentAccum = "";
  let currentFileIndex = 0;
  await mkdir(FOLDER_FOR_INTERMEDIATE_FILES, { recursive: true });
  return new Promise((resolve) => {
    sourceFile.on("data", async (chunk) => {
      currentReadBytes += getActualBytesOfString(chunk);
      if (currentReadBytes <= bytesPerFile) {
        fileContentAccum += chunk;
      }
      else {
        sourceFile.pause();
        const overhead = currentReadBytes - bytesPerFile;
        const lastChunkBytes = stringToByteArray(chunk);
        const partThatCanBeWritten = byteArrayToString(lastChunkBytes.slice(0, lastChunkBytes.length - overhead));
        let restPart = byteArrayToString(lastChunkBytes.slice(lastChunkBytes.length - overhead));
        fileContentAccum += partThatCanBeWritten;
        while (!fileContentAccum.endsWith(FILE_DELIMETER) || !restPart.length) {
          fileContentAccum += restPart[0];
          restPart = restPart.slice(1, restPart.length);
        }
        const fileContent = fileContentAccum.split(FILE_DELIMETER).sort((a, b) => +a - +b).join(FILE_DELIMETER);
        const intermediateFile = fs.createWriteStream(`${FOLDER_FOR_INTERMEDIATE_FILES}/${currentFileIndex}.txt`);
        await writeToFile(intermediateFile, fileContent);
        currentFileIndex++;
        fileContentAccum = restPart || "";
        currentReadBytes = restPart?.length || 0;
        sourceFile.resume();
      }
    });
    sourceFile.on("end", async () => {
      if (fileContentAccum) {
        const fileContent = fileContentAccum.split(FILE_DELIMETER).sort((a, b) => +a - +b).join(FILE_DELIMETER);
        const intermediateFile = fs.createWriteStream(`${FOLDER_FOR_INTERMEDIATE_FILES}/${currentFileIndex}.txt`);
        await writeToFile(intermediateFile, fileContent);
      }
      resolve(currentFileIndex);
    })
  });
}

exports.createIntermediateSortedFiles = createIntermediateSortedFiles;