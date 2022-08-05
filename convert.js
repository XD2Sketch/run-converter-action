const core = require('@actions/core');
const cp = require('child_process');

const executable = core.getInput('executable');

const runConverter = async (filePath) => {
  const converter = cp.spawn('node', [executable, filePath], {
    stdio: ['ignore', 'ipc', 'pipe'],
  });

  return new Promise((resolve, reject) => {
    converter.stderr.on('data', (data) => {
      converter.kill('SIGABRT');
      reject(new Error(data.toString()));
    });

    converter.on('message', (message) => {
      const parsed = JSON.parse(message);
      switch (parsed.type) {
        case 'error': {
          converter.kill('SIGABRT');
          reject(new Error(message));
          return;
        }
        case 'progress':
          console.log('PROGRESS: Working on %s (%d out of %d)', parsed.currentArtboardName, parsed.currentArtboard, parsed.totalArtboards);
          return;
        case 'warning':
          console.warn('WARNING: %s', parsed.message);
          return;
      }
    });

    converter.on('exit', (code) => resolve());
  });
};

module.exports.runConverter = runConverter;
