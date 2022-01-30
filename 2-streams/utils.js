const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //Максимум не включается, минимум включается
}

const prepareIntForWriting = int => int.toString();
const stringToByteArray = string => {
  if(!stringToByteArray.textEncoder) {
    stringToByteArray.textEncoder = new TextEncoder("utf-8");
  }
  return stringToByteArray.textEncoder.encode(string);
}
const byteArrayToString = byteArray => {
  if(!byteArrayToString.textDecoder) {
    byteArrayToString.textDecoder = new TextDecoder("utf-8");
  }
  return byteArrayToString.textDecoder.decode(byteArray);
}
const getActualBytesOfString = string => {
  return stringToByteArray(string).length;
}

exports.getRandomInt = getRandomInt;
exports.prepareIntForWriting = prepareIntForWriting;
exports.getActualBytesOfString = getActualBytesOfString;
exports.stringToByteArray = stringToByteArray;
exports.byteArrayToString = byteArrayToString;