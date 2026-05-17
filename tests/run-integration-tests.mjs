import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const integrationDir = path.join(currentDir, 'integration');
const entries = await readdir(integrationDir, { withFileTypes: true });

const testFiles = entries
  .filter((entry) => entry.isFile() && entry.name.endsWith('.test.js'))
  .map((entry) => path.join(integrationDir, entry.name));

if (testFiles.length === 0) {
  console.error('No integration test files found in tests/integration');
  process.exit(1);
}

const result = spawnSync(process.execPath, ['--test', ...testFiles], {
  stdio: 'inherit',
  shell: false,
});

process.exit(result.status ?? 1);