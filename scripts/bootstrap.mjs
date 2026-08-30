#!/usr/bin/env node

import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const targets = [resolve(root, 'apps/api/.env'), resolve(root, 'apps/web/.env')];
const defaults = {
  name: 'Dashboard',
  version: '0.1.0',
  apiPort: '8787',
  webName: 'Dashboard Clock',
  links: [
    { label: 'YouTube', href: 'https://www.youtube.com/' },
    { label: 'X', href: 'https://x.com/' },
    { label: 'ChatGPT', href: 'https://chatgpt.com/' },
    { label: 'Claude', href: 'https://claude.ai/' },
  ],
};

export function parseArgs(argv) {
  const values = { ...defaults, yes: false };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--yes') values.yes = true;
    else if (argument === '--name') values.name = argv[++index];
    else if (argument === '--version') values.version = argv[++index];
    else if (argument === '--api-port') values.apiPort = argv[++index];
    else if (argument === '--web-name') values.webName = argv[++index];
    else if (argument === '--links') values.links = JSON.parse(argv[++index]);
    else if (argument === '--help') values.help = true;
    else throw new Error(`不明な引数です: ${argument}`);
  }
  return values;
}

function requireValue(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} は空にできません`);
  return value.trim();
}

function requirePort(value) {
  const port = Number(requireValue(value, 'APIポート'));
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('APIポートは 1〜65535 の整数で指定してください');
  }
  return String(port);
}

export function envContents(values) {
  const name = requireValue(values.name, 'アプリ名');
  const version = requireValue(values.version, 'バージョン');
  const webName = requireValue(values.webName, 'Webアプリ名');
  const apiPort = requirePort(values.apiPort);
  if (!Array.isArray(values.links) || values.links.length === 0) {
    throw new Error('リンクは1件以上のJSON配列で指定してください');
  }
  for (const link of values.links) {
    if (
      !link ||
      typeof link.label !== 'string' ||
      !link.label.trim() ||
      typeof link.href !== 'string' ||
      !link.href.startsWith('https://')
    ) {
      throw new Error('リンクは label と https:// の href を持つ必要があります');
    }
  }
  const links = JSON.stringify(values.links);
  return {
    api: `DATABASE_URL="file:./dev.db"\nAPP_NAME=${JSON.stringify(name)}\nAPP_VERSION=${JSON.stringify(version)}\nPORT=${apiPort}\n`,
    web: `VITE_APP_NAME=${JSON.stringify(webName)}\nVITE_EXTERNAL_LINKS=${JSON.stringify(links)}\n`,
  };
}

export function writeIfMissing(path, contents) {
  if (existsSync(path)) return false;
  writeFileSync(path, contents, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
  return true;
}

function assertTemplateRoot() {
  const packagePath = resolve(root, 'package.json');
  if (!existsSync(resolve(root, '.git')) || !existsSync(packagePath)) {
    throw new Error(`テンプレートのルートで実行してください: ${root}`);
  }
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
  if (packageJson.name !== 'dashboard' || !Array.isArray(packageJson.workspaces)) {
    throw new Error('このディレクトリは Dashboard テンプレートとして認識できません');
  }
}

function usage() {
  output.write(
    `使い方: npm run bootstrap -- [オプション]\n\n  --name NAME       APIアプリ名\n  --version VERSION APIバージョン\n  --api-port PORT   APIポート\n  --web-name NAME   Webアプリ名\n  --links JSON      HTTPSリンクのJSON配列\n  --yes             確認を省略（既存ファイルは常に保護）\n`,
  );
}

async function collect(values) {
  if (!input.isTTY || values.yes) return values;
  const rl = createInterface({ input, output });
  try {
    values.name = (await rl.question(`アプリ名 [${values.name}]: `)) || values.name;
    values.version = (await rl.question(`バージョン [${values.version}]: `)) || values.version;
    values.apiPort = (await rl.question(`APIポート [${values.apiPort}]: `)) || values.apiPort;
    values.webName = (await rl.question(`Webアプリ名 [${values.webName}]: `)) || values.webName;
    const answer = await rl.question('この内容で初期化しますか? [Y/n] ');
    if (answer.trim() && !/^y(es)?$/i.test(answer.trim())) throw new Error('初期化を中止しました');
    return values;
  } finally {
    rl.close();
  }
}

export async function main(argv = process.argv.slice(2)) {
  const values = parseArgs(argv);
  if (values.help) return usage();
  assertTemplateRoot();
  output.write(
    `作成対象:\n- ${targets[0]}\n- ${targets[1]}\n既存ファイルは変更せず、秘密情報（S3キー等）は生成しません。\n`,
  );
  const selected = await collect(values);
  const contents = envContents(selected);
  const generated = [
    writeIfMissing(targets[0], contents.api),
    writeIfMissing(targets[1], contents.web),
  ];
  output.write(
    `完了: ${generated.filter(Boolean).length} 件作成、${generated.filter((item) => !item).length} 件は既存のため維持しました。\n`,
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(`bootstrap失敗: ${error.message}`);
    process.exitCode = 1;
  });
}
