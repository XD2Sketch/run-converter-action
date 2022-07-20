const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const path = require('path');
const aws = require('./aws');
const runner = require('./convert');
const postMessage = require('./post-message');
const tmpDir = require('./tmp-dir');

const inputFileName = core.getInput('file-name');
const awsOutputDir = core.getInput('aws-output-directory');
const outputFileName = inputFileName.replace(/\.xd$/, `.${awsOutputDir}`);
const awsFileName = `${github.context.issue.number}_${outputFileName}`;
const messageEnabled = core.getInput('post-message-enabled') === '1';
const executable = core.getInput('executable');
const conversionType = core.getInput('conversion-type');
let filePath = path.join(tmpDir.name, fileName);
if (conversionType === 'f2S') filePath = fileName;

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
