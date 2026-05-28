import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const url = process.argv[2] ?? 'http://127.0.0.1:5174/';
const userDataDir = mkdtempSync(join(tmpdir(), 'cmv-chrome-guest-'));

const child = spawn(
  chromePath,
  [
    '--guest',
    '--new-window',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${userDataDir}`,
    url,
  ],
  {
    detached: true,
    stdio: 'ignore',
  },
);

child.unref();
console.log(`Chrome invitado abierto en ${url}`);
