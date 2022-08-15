const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const path = require('path');
const aws = require('./aws');
const runner = require('./convert');
const postMessage = require('./post-message');
const tmpDir = require('./tmp-dir');

const getOutputFileName = (inputFileName, conversionType, awsOutputDir) => {
  if (conversionType === 'XD2S') return inputFileName.replace(/\.xd$/, `.${awsOutputDir}`);
  if (conversionType === 'F2S') return `${inputFileName}.${awsOutputDir}`;
}

const getFilePath = (fileName) => {
  if (conversionType === 'XD2S') return path.join(tmpDir.name, fileName);
  if (conversionType === 'F2S') return fileName;
}

const getOutputFilePath = (outputFileName, conversionType) => {
  if (conversionType === 'XD2S') return path.join(tmpDir.name, outputFileName);
  if (conversionType === 'F2S') return path.join(tmpDir.name, 'output', outputFileName);
}

const inputFileName = core.getInput('file-name');
const awsOutputDir = core.getInput('aws-output-directory');
const conversionType = core.getInput('conversion-type');
const outputFileName = getOutputFileName(inputFileName, conversionType, awsOutputDir);
const outputFilePath = getOutputFilePath(outputFileName, conversionType);
const awsFileName = `${github.context.issue.number}_${outputFileName}`;
const messageEnabled = core.getInput('post-message-enabled') === '1';
const filePath = getFilePath(inputFileName);

if (conversionType === 'XD2S') {
  console.log('Converting xd file to sketch file');
  aws.getFile()
  .then((data) => fs.writeFileSync(path.join(tmpDir.name, inputFileName), data.Body))
  .then(() => console.log(`"${inputFileName}" is downloaded from AWS`))
  .then(() => runner.runConverter(filePath))
  .then(() => console.log(`"${inputFileName}" successfully converted to ${awsOutputDir}`))
  .then(() => fs.readFileSync(path.join(tmpDir.name, outputFilePath)))
  .then((data) => aws.uploadFile(awsFileName, data))
  .then(() => console.log(`"${awsFileName}" successfully uploaded to AWS`))
  .then(() => messageEnabled && postMessage(`Successfully converted ${inputFileName}\n\nResult available at: ${aws.getUrl(awsFileName)}`))
  .catch((error) => core.setFailed(error.message + " XD2S Error"));
} else {
  console.log('Converting figma file to sketch file');
  runner.runConverter(filePath)
  .then(() => console.log(`"${inputFileName}" successfully converted to ${awsOutputDir}`))
  .then(() => fs.readFileSync(path.join(tmpDir.name, outputFilePath)))
  .then((data) => aws.uploadFile(awsFileName, data))
  .then(() => console.log(`"${awsFileName}" successfully uploaded to AWS`))
  .then(() => messageEnabled && postMessage(`Successfully converted ${inputFileName}\n\nResult available at: ${aws.getUrl(awsFileName)}`))
  .catch((error) => core.setFailed(error.message + " F2S Error"));
}
