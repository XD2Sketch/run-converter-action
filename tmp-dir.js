const tmp = require('tmp-promise')

const dir = tmp.dirSync({
  unsafeCleanup: true,
})

exports = dir
module.exports = dir
