const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const path = require('path');
const aws = require('./aws');
const runner = require('./convert');
const postMessage = require('./post-message');
const tmpDir = require('./tmp-dir');
const F2S_OUTPUT_DIR = 'output';

const convertExtension = (filename, conversionType, extension) => {
  if (conversionType === 'F2S') return `${filename}.${extension}`;
  if (conversionType === 'XD2S') filename.replace(/\.xd$/, `.${extension}`)
};

const getFilePath = (filename, conversionType) => { 
  if (conversionType === 'F2S') return filename;
  if (conversionType === 'XD2S') return path.join(tmpDir.name, inputFileName);
};

const inputFileName = core.getInput('file-name');
const awsOutputDir = core.getInput('aws-output-directory');
const conversionType = core.getInput('conversion-type');
const messageEnabled = core.getInput('post-message-enabled') === '1';
const executable = core.getInput('executable');

const outputFileName = convertExtension(inputFileName, conversionType, awsOutputDir);
const awsFileName = `${github.context.issue.number}_${outputFileName}`;
const filePath = getFilePath(inputFileName, conversionType);

if (conversionType === 'F2S') {
  runner.runConverter(executable, filePath)
  .then(() => console.log(`"${inputFileName}" successfully converted to ${awsOutputDir}`))
  .then(() => fs.readFileSync(path.join(tmpDir.name, F2S_OUTPUT_DIR, outputFileName)))
  .then((data) => aws.uploadFile(awsFileName, data))
  .then(() => console.log(`"${awsFileName}" successfully uploaded to AWS`))
  .then(() => messageEnabled && postMessage(`Successfully converted ${inputFileName}\n\nResult available at: ${aws.getUrl(awsFileName)}`))
  .catch((error) => core.setFailed(error));
} else {
  aws.getFile()
  .then((data) => fs.writeFileSync(path.join(tmpDir.name, inputFileName), data.Body))
  .then(() => console.log(`"${inputFileName}" is downloaded from AWS`))
  .then(() => runner.runConverter(executable, filePath))
  .then(() => console.log(`"${inputFileName}" successfully converted to ${awsOutputDir}`))
  .then(() => fs.readFileSync(path.join(tmpDir.name, outputFileName)))
  .then((data) => aws.uploadFile(awsFileName, data))
  .then(() => console.log(`"${awsFileName}" successfully uploaded to AWS`))
  .then(() => messageEnabled && postMessage(`Successfully converted ${inputFileName}\n\nResult available at: ${aws.getUrl(awsFileName)}`))
  .catch((error) => core.setFailed(error));
}
