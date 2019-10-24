const assert = require('assert');
const spawn = require('cross-spawn');

const validNpmClients = [
  'yarn',
  'tyarn',
  'ayarn',
  'npm',
  'cnpm',
  'tnpm',
  'pnpm',
];

function install(packageName, cwd, opts = {}) {
  const { saveDev, slient, npmClient, onData } = opts;
  assert(
    npmClient,
    `opts.npmClient must be supplied.`,
  );
  assert(
    validNpmClients.includes(npmClient),
    `Invalid opts.npmClient ${npmClient}.`,
  );
  const isYarn = ['yarn', 'tyarn', 'ayarn'].includes(npmClient);

  let args = isYarn ? ['add'] : ['install'];
  args.push(packageName);
  if (saveDev) {
    args.push(isYarn ? '-D' : '--save-dev');
  } else if (!isYarn) {
    args.push('--save');
  }

  return new Promise((resolve, reject) => {
    const extraEnv = {};
    const child = spawn(npmClient, args, {
      cwd,
      env: {
        ...process.env,
        ...extraEnv,
      },
    });
    child.stdout.on('data', buffer => {
      if (!slient) process.stdout.write(buffer);
      if (onData) onData(buffer.toString());
    });
    child.stderr.on('data', buffer => {
      if (!slient) process.stderr.write(buffer);
      if (onData) onData(buffer.toString());
    });
    child.on('close', code => {
      if (code !== 0) {
        reject(new Error(`command failed: ${npmClient} ${args.join(' ')}`));
        return;
      }
      resolve();
    });
  });
}

module.exports = async function (...args) {
  // TODO: Promise 队列
  await install(...args);
}
