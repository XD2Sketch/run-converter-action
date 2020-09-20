const core = require('@actions/core')
const github = require('@actions/github')
const fs = require('fs')
const path = require('path')
const aws = require('./aws')
const runner = require('./convert')
const tmpDir = require('./tmp-dir')

const inputFileName = core.getInput('file-name')
const awsOutputDir = core.getInput('aws-output-directory')
const outputFileName = inputFileName.replace(/\.xd$/, `.${awsOutputDir}`)
const awsFileName = `${github.context.issue.number}_${outputFileName}`

aws.getFile()
  .then((data) => {
    fs.writeFileSync(path.join(tmpDir.name, inputFileName), data.Body, { encoding: 'binary' })
  })
  .then(() => console.log(`"${inputFileName}" is downloaded from AWS`))
  .then(() => runner.runConverter())
  .then(() => console.log(`"${inputFileName}" successfully converted to ${awsOutputDir}`))
  .then(() => fs.readFileSync(path.join(tmpDir.name, outputFileName), { encoding: 'binary' }))
  .then((data) => aws.uploadFile(awsFileName, data))
  .then(() => console.log(`"${awsFileName}" successfully uploaded to AWS`))
  .then(() => core.setOutput('output-file-url', aws.getUrl(awsFileName)))
  .catch((error) => core.setFailed(error))
