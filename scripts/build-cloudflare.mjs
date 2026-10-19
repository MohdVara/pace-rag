import { spawnSync } from 'node:child_process';

// Fresh Cloudflare Git builds have neither model assets nor current.json.
// Prepare approved indexes before the publication/ranking freshness checks.
const commands = [
  ['npm', ['run', 'lint']],
  ['npm', ['run', 'content:validate']],
  ['npm', ['run', 'model:prepare']],
  ['npx', ['--no-install', 'playwright', 'install', 'chromium']],
  ['npx', ['--no-install', 'vite', 'build', '--config', 'vite.worker.config.ts']],
  ['node', ['scripts/worker-assets.mjs']],
  ['node', ['scripts/indexing/build.mjs', '--release', '--embed']],
  ['npm', ['run', 'release:check']],
  ['npm', ['run', 'index:verify']],
  ['npx', ['--no-install', 'vite', 'build']],
  ['node', ['scripts/static-pages.mjs']],
  ['npm', ['run', 'package:static', '--', '--release']],
  ['npm', ['run', 'release:artifact-check']],
];

for (const [command, args] of commands) {
  console.log(`\n> ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, { stdio: 'inherit', env: process.env });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
