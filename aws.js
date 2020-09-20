const core = require('@actions/core')
const aws = require('aws-sdk')

const inputFileName = core.getInput('file-name')
const awsInputDir = core.getInput('aws-input-directory')
const awsOutputDir = core.getInput('aws-output-directory')
const bucket = core.getInput('aws-bucket-name')

const s3 = new aws.S3()

const getFile = () => {
  const s3Params = {
    Bucket: bucket,
    Key: `${awsInputDir}/${inputFileName}`,
  }

  return s3.getObject(s3Params).promise()
}

const uploadFile = (fileName, data) => {
  const s3Params = {
    Bucket: bucket,
    Key: `${awsOutputDir}/${fileName}`,
    Expires: 60,
    ContentType: 'application/octet-stream',
    ACL: 'public-read',
    Body: data,
  }

  return s3.putObject(s3Params).promise()
}

const getUrl = (fileName) => `https://${bucket}.s3.amazonaws.com/${awsOutputDir}/${encodeURIComponent(fileName)}`

module.exports.getUrl = getUrl
module.exports.getFile = getFile
module.exports.uploadFile = uploadFile
