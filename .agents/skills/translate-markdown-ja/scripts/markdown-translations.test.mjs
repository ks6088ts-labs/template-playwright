import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, test } from 'node:test';

import {
  checkTranslations,
  discoverSources,
  getTranslationStatuses,
  japanesePathFor,
  stampTranslation,
} from './markdown-translations.mjs';

const temporaryRoots = [];

async function makeRoot() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'markdown-translations-'));
  temporaryRoots.push(root);
  await mkdir(path.join(root, 'docs'), { recursive: true });
  return root;
}

async function put(root, repositoryPath, content) {
  const absolutePath = path.join(root, repositoryPath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, content, 'utf8');
}

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

test('maps an English Markdown path to its Japanese sibling', () => {
  assert.equal(japanesePathFor('README.md'), 'README.ja.md');
  assert.equal(japanesePathFor('docs/setup.guide.md'), 'docs/setup.guide.ja.md');
  assert.throws(() => japanesePathFor('README.ja.md'), /English Markdown source/);
});

test('discovers root and nested English sources while excluding translations', async () => {
  const root = await makeRoot();
  await put(root, 'README.md', '# Root\n');
  await put(root, 'README.ja.md', '# ルート\n');
  await put(root, 'docs/guide.md', '# Guide\n');
  await put(root, 'docs/nested/topic.md', '# Topic\n');
  await put(root, 'docs/nested/topic.ja.md', '# トピック\n');

  assert.deepEqual(await discoverSources(root), [
    'docs/guide.md',
    'docs/nested/topic.md',
    'README.md',
  ]);
});

test('stamps after frontmatter and reports current then stale status', async () => {
  const root = await makeRoot();
  const frontmatter = '---\ntitle: Example\n---';
  await put(root, 'README.md', `${frontmatter}\n# Example\n`);
  await put(root, 'README.ja.md', `${frontmatter}\n# 例\n`);

  await stampTranslation(root, 'README.md');
  const stamped = await readFile(path.join(root, 'README.ja.md'), 'utf8');
  assert.match(stamped, /^---\ntitle: Example\n---\n\n<!-- translation-meta\n/);
  assert.equal((await getTranslationStatuses(root))[0].state, 'current');

  await put(root, 'README.md', `${frontmatter}\n# Changed\n`);
  assert.equal((await getTranslationStatuses(root))[0].state, 'stale');
});

test('accepts preserved literals, Japanese links, and explicit source anchors', async () => {
  const root = await makeRoot();
  const code = '```sh\necho hello\n```';
  await put(root, 'README.md', [
    '# Home',
    '',
    '[Guide](docs/guide.md) and [Setup](#setup).',
    'Use `pnpm test`, {{VALUE}}, and https://example.com/docs.',
    '',
    '## Setup',
    '',
    code,
    '',
  ].join('\n'));
  await put(root, 'docs/guide.md', '# Guide\n');
  await put(root, 'README.ja.md', [
    '# ホーム',
    '',
    '[ガイド](docs/guide.ja.md)と[設定](#setup)。',
    '`pnpm test`、{{VALUE}}、https://example.com/docs を使用します。',
    '',
    '<a id="setup"></a>',
    '## 設定',
    '',
    code,
    '',
  ].join('\n'));
  await put(root, 'docs/guide.ja.md', '# ガイド\n');
  await stampTranslation(root, 'README.md');
  await stampTranslation(root, 'docs/guide.md');

  const result = await checkTranslations(root);
  assert.deepEqual(result.errors, []);
  assert.equal(result.ok, true);
});

test('detects changed placeholders, English links, and orphan translations', async () => {
  const root = await makeRoot();
  await put(root, 'README.md', '[Guide](docs/guide.md) {{VALUE}}\n');
  await put(root, 'docs/guide.md', '# Guide\n');
  await put(root, 'README.ja.md', '[ガイド](docs/guide.md) {{CHANGED}}\n');
  await put(root, 'docs/guide.ja.md', '# ガイド\n');
  await put(root, 'docs/orphan.ja.md', '# 孤立\n');
  await stampTranslation(root, 'README.md');
  await stampTranslation(root, 'docs/guide.md');

  const result = await checkTranslations(root);
  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /placeholder changed/);
  assert.match(result.errors.join('\n'), /Markdown link destination changed/);
  assert.match(result.errors.join('\n'), /link must target the Japanese sibling/);
  assert.match(result.errors.join('\n'), /English source does not exist/);
});