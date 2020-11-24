const core = require('@actions/core')
const cp = require('child_process')
const path = require('path')
const util = require('util')
const tmpDir = require('./tmp-dir')

const execute = util.promisify(cp.exec);

const executable = core.getInput('executable')
const fileName = core.getInput('file-name')
const filePath = path.join(tmpDir.name, fileName);

const runConverter = async () => {
  const { stdout, stderr } = await execute(`node ${executable} ${filePath} --experimental-symbols`);
  console.log(stdout);
  if (stderr && stderr.trim()) {
    throw stderr;
  }
};

module.exports.runConverter = runConverter
