import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import { envContents, parseArgs, writeIfMissing } from './bootstrap.mjs';

test('引数と環境ファイル内容を規約どおり生成する', () => {
  const values = parseArgs([
    '--name',
    'Example',
    '--version',
    '2.0.0',
    '--api-port',
    '9000',
    '--web-name',
    'Example Web',
    '--yes',
  ]);
  const contents = envContents({
    ...values,
    links: [{ label: 'Docs', href: 'https://docs.example.test/' }],
  });
  assert.match(contents.api, /APP_NAME="Example"/);
  assert.match(contents.api, /PORT=9000/);
  assert.match(contents.web, /VITE_APP_NAME="Example Web"/);
  assert.match(contents.web, /VITE_EXTERNAL_LINKS=/);
  assert.doesNotMatch(contents.api, /S3_SECRET_ACCESS_KEY|S3_ACCESS_KEY_ID/);
});

test('既存ファイルを上書きしない', () => {
  const directory = mkdtempSync(join(tmpdir(), 'dashboard-bootstrap-'));
  const path = join(directory, '.env');
  writeIfMissing(path, 'KEEP=1\n');
  assert.equal(writeIfMissing(path, 'OVERWRITE=1\n'), false);
  assert.equal(readFileSync(path, 'utf8'), 'KEEP=1\n');
});

test('安全でない入力を拒否する', () => {
  assert.throws(() =>
    envContents({
      name: 'x',
      version: '1',
      apiPort: '0',
      webName: 'x',
      links: [{ label: 'x', href: 'http://x.test' }],
    }),
  );
});
