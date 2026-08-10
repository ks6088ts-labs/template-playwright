import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const DEFAULT_INPUTS = ['README.md', 'docs'];
const TRANSLATION_SUFFIX = '.ja.md';
const METADATA_PATTERN = /<!-- translation-meta\r?\n([\s\S]*?)\r?\n-->/g;

export function japanesePathFor(sourcePath) {
  if (!sourcePath.endsWith('.md') || sourcePath.endsWith(TRANSLATION_SUFFIX)) {
    throw new Error(`Expected an English Markdown source, received: ${sourcePath}`);
  }

  return `${sourcePath.slice(0, -3)}${TRANSLATION_SUFFIX}`;
}

export function sourcePathFor(translationPath) {
  if (!translationPath.endsWith(TRANSLATION_SUFFIX)) {
    throw new Error(`Expected a Japanese Markdown translation, received: ${translationPath}`);
  }

  return `${translationPath.slice(0, -TRANSLATION_SUFFIX.length)}.md`;
}

export function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

function toRepositoryPath(root, absolutePath) {
  const relativePath = path.relative(root, absolutePath);
  if (relativePath === '..' || relativePath.startsWith(`..${path.sep}`)) {
    throw new Error(`Path is outside the repository root: ${absolutePath}`);
  }

  return relativePath.split(path.sep).join('/');
}

function fromRepositoryPath(root, repositoryPath) {
  const absolutePath = path.resolve(root, repositoryPath);
  toRepositoryPath(root, absolutePath);
  return absolutePath;
}

async function pathType(absolutePath) {
  try {
    const entry = await stat(absolutePath);
    return entry.isDirectory() ? 'directory' : entry.isFile() ? 'file' : 'other';
  } catch (error) {
    if (error.code === 'ENOENT') {
      return 'missing';
    }
    throw error;
  }
}

async function walk(directory, predicate) {
  const matches = [];
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      matches.push(...await walk(absolutePath, predicate));
    } else if (entry.isFile() && predicate(entry.name)) {
      matches.push(absolutePath);
    }
  }

  return matches;
}

export async function discoverSources(root, requestedPaths = []) {
  const inputs = requestedPaths.length > 0 ? requestedPaths : DEFAULT_INPUTS;
  const sources = new Set();

  for (const input of inputs) {
    const absoluteInput = fromRepositoryPath(root, input);
    const type = await pathType(absoluteInput);
    if (type === 'missing') {
      throw new Error(`Translation input does not exist: ${input}`);
    }

    if (type === 'file') {
      const repositoryPath = toRepositoryPath(root, absoluteInput);
      if (repositoryPath.endsWith('.md') && !repositoryPath.endsWith(TRANSLATION_SUFFIX)) {
        sources.add(repositoryPath);
      }
      continue;
    }

    if (type === 'directory') {
      const matches = await walk(
        absoluteInput,
        (name) => name.endsWith('.md') && !name.endsWith(TRANSLATION_SUFFIX),
      );
      for (const match of matches) {
        sources.add(toRepositoryPath(root, match));
      }
    }
  }

  return [...sources].sort((left, right) => left.localeCompare(right));
}

async function discoverTranslations(root) {
  const translations = [];
  const rootTranslation = path.join(root, 'README.ja.md');
  if (existsSync(rootTranslation)) {
    translations.push('README.ja.md');
  }

  const docsPath = path.join(root, 'docs');
  if (await pathType(docsPath) === 'directory') {
    const matches = await walk(docsPath, (name) => name.endsWith(TRANSLATION_SUFFIX));
    translations.push(...matches.map((match) => toRepositoryPath(root, match)));
  }

  return translations.sort((left, right) => left.localeCompare(right));
}

function metadataBlock(sourcePath, sourceHash) {
  return [
    '<!-- translation-meta',
    `source: ${sourcePath}`,
    `sourceHash: sha256:${sourceHash}`,
    'canonicalLanguage: en',
    '-->',
  ].join('\n');
}

function parseMetadata(content) {
  const matches = [...content.matchAll(METADATA_PATTERN)];
  if (matches.length !== 1) {
    return { valid: false, reason: `expected one translation-meta block, found ${matches.length}` };
  }

  const fields = {};
  for (const line of matches[0][1].split(/\r?\n/)) {
    const field = line.match(/^([A-Za-z][A-Za-z0-9]*):\s*(.+)$/);
    if (!field || fields[field[1]] !== undefined) {
      return { valid: false, reason: 'translation-meta contains a malformed or duplicate field' };
    }
    fields[field[1]] = field[2];
  }

  if (!fields.source || !/^sha256:[a-f0-9]{64}$/.test(fields.sourceHash ?? '')) {
    return { valid: false, reason: 'translation-meta source or sourceHash is invalid' };
  }
  if (fields.canonicalLanguage !== 'en') {
    return { valid: false, reason: 'translation-meta canonicalLanguage must be en' };
  }

  return { valid: true, ...fields };
}

function frontmatterEnd(content) {
  if (!content.startsWith('---\n') && !content.startsWith('---\r\n')) {
    return 0;
  }

  const match = content.match(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/);
  return match?.[0].length ?? 0;
}

export async function stampTranslation(root, sourcePath) {
  const normalizedSource = toRepositoryPath(root, fromRepositoryPath(root, sourcePath));
  const translationPath = japanesePathFor(normalizedSource);
  const sourceContent = await readFile(fromRepositoryPath(root, normalizedSource), 'utf8');
  const translationAbsolutePath = fromRepositoryPath(root, translationPath);
  let translationContent = await readFile(translationAbsolutePath, 'utf8');

  translationContent = translationContent.replace(METADATA_PATTERN, '').replace(/^\s*\n/, '');
  const insertAt = frontmatterEnd(translationContent);
  const metadata = metadataBlock(normalizedSource, sha256(sourceContent));
  const before = translationContent.slice(0, insertAt).replace(/\s*$/, '');
  const after = translationContent.slice(insertAt).replace(/^\s*/, '');
  const stamped = before.length > 0
    ? `${before}\n\n${metadata}\n\n${after}`
    : `${metadata}\n\n${after}`;

  await writeFile(translationAbsolutePath, stamped, 'utf8');
  return translationPath;
}

export async function getTranslationStatuses(root, requestedPaths = []) {
  const sources = await discoverSources(root, requestedPaths);
  const statuses = [];

  for (const sourcePath of sources) {
    const translationPath = japanesePathFor(sourcePath);
    const sourceContent = await readFile(fromRepositoryPath(root, sourcePath), 'utf8');
    const sourceHash = sha256(sourceContent);
    const translationAbsolutePath = fromRepositoryPath(root, translationPath);
    if (!existsSync(translationAbsolutePath)) {
      statuses.push({ sourcePath, translationPath, sourceHash, state: 'missing' });
      continue;
    }

    const translationContent = await readFile(translationAbsolutePath, 'utf8');
    const metadata = parseMetadata(translationContent);
    if (!metadata.valid || metadata.source !== sourcePath) {
      statuses.push({
        sourcePath,
        translationPath,
        sourceHash,
        state: 'invalid',
        reason: metadata.valid ? `metadata source is ${metadata.source}` : metadata.reason,
      });
      continue;
    }

    if (metadata.sourceHash !== `sha256:${sourceHash}`) {
      statuses.push({
        sourcePath,
        translationPath,
        sourceHash,
        state: 'stale',
        reason: `recorded ${metadata.sourceHash}`,
      });
      continue;
    }

    statuses.push({ sourcePath, translationPath, sourceHash, state: 'current' });
  }

  return statuses;
}

function fencedBlocks(content) {
  return content.match(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1[ \t]*$/gm) ?? [];
}

function withoutFencedBlocks(content) {
  return content.replace(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1[ \t]*$/gm, (block) => (
    '\n'.repeat(block.split('\n').length - 1)
  ));
}

function inlineCode(content) {
  return withoutFencedBlocks(content).match(/(`+)([^`\n]*?)\1/g) ?? [];
}

function prose(content) {
  return withoutFencedBlocks(content)
    .replace(METADATA_PATTERN, '')
    .replace(/(`+)([^`\n]*?)\1/g, '');
}

function placeholders(content) {
  return content.match(/\{\{[^{}\n]+\}\}/g) ?? [];
}

function externalUrls(content) {
  return (prose(content).match(/https?:\/\/[^\s<>"')\]]+/g) ?? [])
    .map((url) => url.replace(/[.,;:!?、。，．！？；：]+$/u, ''));
}

function countItems(items) {
  const counts = new Map();
  for (const item of items) {
    counts.set(item, (counts.get(item) ?? 0) + 1);
  }
  return counts;
}

function compareExact(label, sourceItems, translationItems, errors, translationPath) {
  const sourceCounts = countItems(sourceItems);
  const translationCounts = countItems(translationItems);
  const allItems = new Set([...sourceCounts.keys(), ...translationCounts.keys()]);
  for (const item of allItems) {
    if ((sourceCounts.get(item) ?? 0) !== (translationCounts.get(item) ?? 0)) {
      errors.push(`${translationPath}: ${label} changed: ${JSON.stringify(item)}`);
    }
  }
}

function frontmatter(content) {
  const end = frontmatterEnd(content);
  return end > 0 ? content.slice(0, end).trimEnd() : '';
}

function linkDestinations(content) {
  const destinations = [];
  const pattern = /!?\[[^\]]*\]\(\s*(?:<([^>]+)>|([^\s)]+))(?:\s+(?:"[^"]*"|'[^']*'|\([^)]*\)))?\s*\)/g;
  for (const match of prose(content).matchAll(pattern)) {
    if (!match[0].startsWith('!')) {
      destinations.push(match[1] ?? match[2]);
    }
  }
  return destinations;
}

function splitDestination(destination) {
  const hashIndex = destination.indexOf('#');
  const beforeHash = hashIndex >= 0 ? destination.slice(0, hashIndex) : destination;
  const fragment = hashIndex >= 0 ? destination.slice(hashIndex + 1) : '';
  const queryIndex = beforeHash.indexOf('?');
  return {
    filePath: queryIndex >= 0 ? beforeHash.slice(0, queryIndex) : beforeHash,
    query: queryIndex >= 0 ? beforeHash.slice(queryIndex) : '',
    fragment,
  };
}

function isExternal(destination) {
  return /^[A-Za-z][A-Za-z0-9+.-]*:/.test(destination) || destination.startsWith('//');
}

function isCanonicalSource(root, absolutePath) {
  const repositoryPath = toRepositoryPath(root, absolutePath);
  return repositoryPath === 'README.md'
    || (repositoryPath.startsWith('docs/')
      && repositoryPath.endsWith('.md')
      && !repositoryPath.endsWith(TRANSLATION_SUFFIX));
}

function expectedTranslatedDestination(root, sourcePath, destination) {
  if (isExternal(destination) || destination.startsWith('#')) {
    return destination;
  }

  const { filePath, query, fragment } = splitDestination(destination);
  if (!filePath.endsWith('.md') || filePath.endsWith(TRANSLATION_SUFFIX)) {
    return destination;
  }

  const linkedSource = path.resolve(path.dirname(fromRepositoryPath(root, sourcePath)), filePath);
  if (!existsSync(linkedSource) || !isCanonicalSource(root, linkedSource)) {
    return destination;
  }

  const linkedTranslation = japanesePathFor(toRepositoryPath(root, linkedSource));
  if (!existsSync(fromRepositoryPath(root, linkedTranslation))) {
    return destination;
  }

  return `${japanesePathFor(filePath)}${query}${fragment ? `#${fragment}` : ''}`;
}

function headingSlug(heading) {
  return heading
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replace(/\s+/g, '-');
}

function hasAnchor(content, fragment) {
  let decodedFragment;
  try {
    decodedFragment = decodeURIComponent(fragment);
  } catch {
    decodedFragment = fragment;
  }

  const escaped = decodedFragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (new RegExp(`<[^>]+(?:id|name)=["']${escaped}["'][^>]*>`, 'i').test(content)) {
    return true;
  }

  for (const match of content.matchAll(/^#{1,6}\s+(.+)$/gm)) {
    if (headingSlug(match[1]) === decodedFragment) {
      return true;
    }
  }
  return false;
}

async function validateLinks(root, sourcePath, translationPath, sourceContent, translationContent, errors) {
  const expectedLinks = linkDestinations(sourceContent).map((destination) => (
    expectedTranslatedDestination(root, sourcePath, destination)
  ));
  compareExact('Markdown link destination', expectedLinks, linkDestinations(translationContent), errors, translationPath);

  for (const destination of linkDestinations(translationContent)) {
    if (isExternal(destination)) {
      continue;
    }

    const { filePath, fragment } = splitDestination(destination);
    let linkedAbsolutePath = fromRepositoryPath(root, translationPath);
    if (filePath) {
      linkedAbsolutePath = path.resolve(path.dirname(linkedAbsolutePath), filePath);
      try {
        toRepositoryPath(root, linkedAbsolutePath);
      } catch {
        errors.push(`${translationPath}: link escapes the repository: ${destination}`);
        continue;
      }

      if (!existsSync(linkedAbsolutePath)) {
        errors.push(`${translationPath}: link target does not exist: ${destination}`);
        continue;
      }

      if (filePath.endsWith('.md') && !filePath.endsWith(TRANSLATION_SUFFIX)
        && isCanonicalSource(root, linkedAbsolutePath)) {
        const linkedSourcePath = toRepositoryPath(root, linkedAbsolutePath);
        if (existsSync(fromRepositoryPath(root, japanesePathFor(linkedSourcePath)))) {
          errors.push(`${translationPath}: link must target the Japanese sibling: ${destination}`);
        }
      }
    }

    if (fragment) {
      const linkedContent = await readFile(linkedAbsolutePath, 'utf8');
      if (!hasAnchor(linkedContent, fragment)) {
        errors.push(`${translationPath}: link fragment does not exist: ${destination}`);
      }
    }
  }
}

async function validatePair(root, status, errors) {
  const sourceContent = await readFile(fromRepositoryPath(root, status.sourcePath), 'utf8');
  const translationContent = await readFile(fromRepositoryPath(root, status.translationPath), 'utf8');

  if (frontmatter(sourceContent) !== frontmatter(translationContent)) {
    errors.push(`${status.translationPath}: YAML frontmatter differs from the English source`);
  }
  compareExact('fenced code block', fencedBlocks(sourceContent), fencedBlocks(translationContent), errors, status.translationPath);
  compareExact('inline code', inlineCode(sourceContent), inlineCode(translationContent), errors, status.translationPath);
  compareExact('placeholder', placeholders(sourceContent), placeholders(translationContent), errors, status.translationPath);
  compareExact('external URL', externalUrls(sourceContent), externalUrls(translationContent), errors, status.translationPath);
  await validateLinks(root, status.sourcePath, status.translationPath, sourceContent, translationContent, errors);
}

export async function checkTranslations(root, requestedPaths = []) {
  const statuses = await getTranslationStatuses(root, requestedPaths);
  const errors = [];

  for (const status of statuses) {
    if (status.state !== 'current') {
      errors.push(`${status.translationPath}: ${status.state}${status.reason ? ` (${status.reason})` : ''}`);
      continue;
    }
    await validatePair(root, status, errors);
  }

  if (requestedPaths.length === 0) {
    for (const translationPath of await discoverTranslations(root)) {
      if (translationPath.endsWith('.ja.ja.md')) {
        errors.push(`${translationPath}: repeated .ja suffix`);
        continue;
      }
      const sourcePath = sourcePathFor(translationPath);
      if (!existsSync(fromRepositoryPath(root, sourcePath))) {
        errors.push(`${translationPath}: English source does not exist: ${sourcePath}`);
      }
    }
  }

  return { ok: errors.length === 0, errors, statuses };
}

async function main() {
  const [command, ...rawArguments] = process.argv.slice(2);
  const json = rawArguments.includes('--json');
  const requestedPaths = rawArguments.filter((argument) => argument !== '--json');
  const root = process.cwd();

  if (command === 'status') {
    const statuses = await getTranslationStatuses(root, requestedPaths);
    if (json) {
      console.log(JSON.stringify(statuses, null, 2));
      return;
    }
    for (const status of statuses) {
      const reason = status.reason ? `; ${status.reason}` : '';
      console.log(`${status.state.toUpperCase()} ${status.sourcePath} -> ${status.translationPath} (sha256:${status.sourceHash}${reason})`);
    }
    return;
  }

  if (command === 'stamp') {
    if (requestedPaths.length === 0) {
      throw new Error('stamp requires at least one English source path');
    }
    for (const sourcePath of requestedPaths) {
      console.log(`Stamped ${await stampTranslation(root, sourcePath)}`);
    }
    return;
  }

  if (command === 'check') {
    const result = await checkTranslations(root, requestedPaths);
    if (json) {
      console.log(JSON.stringify(result, null, 2));
    } else if (result.ok) {
      console.log(`Translation check passed for ${result.statuses.length} file(s).`);
    } else {
      for (const error of result.errors) {
        console.error(`ERROR ${error}`);
      }
    }
    process.exitCode = result.ok ? 0 : 1;
    return;
  }

  throw new Error('Usage: markdown-translations.mjs <status|stamp|check> [--json] [paths...]');
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}