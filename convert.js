const core = require('@actions/core')
const cp = require('child_process')
const path = require('path')
const util = require('util')
const tmpDir = require('./tmp-dir')

const executable = core.getInput('executable')
const inputFileName = core.getInput('file-name')

const MESSAGE_TEMPLATE = 'ERROR!\nfile: %s\ndescription: %s\nstacktrace: %s\nadditional info: %s'

const runConverter = () => new Promise((resolve, reject) => {
  const converter = cp.fork(executable, [
    path.join(tmpDir.name, inputFileName),
    '--experimental-symbols',
  ])

  converter.on('message', (msg) => {
    const parsed = JSON.parse(msg)
    if (parsed.type === 'error') {
      reject(new Error(util.format(
        MESSAGE_TEMPLATE,
        inputFileName,
        parsed.message,
        parsed.stack,
        parsed.additionalInfo || 'Not available',
      )))
      converter.kill()
    } else {
      console.log('received message: %O', parsed);
    }
  })

  converter.on('exit', (code) => {
    if (code === 0) resolve()
    else reject()
  })
})

module.exports.runConverter = runConverter
