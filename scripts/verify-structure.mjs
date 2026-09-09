#!/usr/bin/env node
/**
 * verify-structure.mjs —— dsh-ecosystem-spec 本仓库的结构、索引与挂载一致性校验。
 *
 * 零依赖：只用 Node 标准库 + git 命令，任何环境都能跑。
 * 规则清单与说明见 docs/directory-guide.md §6。
 *
 * 用法：node scripts/verify-structure.mjs
 */

import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/* ------------------------------------------------------------------ 工具 */

const failures = [];
const notes = [];

const rel = (p) => p.split(sep).join('/');
const fail = (msg) => failures.push(msg);
const note = (msg) => notes.push(msg);

function section(title) {
  console.log(`\n${title}`);
}

function ok(msg) {
  console.log(`  ok    ${msg}`);
}

function git(args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
}

/* ------------------------------------------------------- 1. 顶层目录白名单 */

const ALLOWED_TOP_LEVEL = new Set([
  '.github',
  '.gitattributes',
  '.gitignore',
  '.gitmodules',
  'CODE_OF_CONDUCT.md',
  'CONTRIBUTING.md',
  'LICENSE',
  'README.md',
  'SECURITY.md',
  'decisions',
  'docs',
  'governance',
  'old',
  'profiles',
  'registry',
  'scripts',
  'vendor',
]);

section('1. 顶层目录白名单');
{
  // 以仓库跟踪的顶层条目为准（CI 只关心会被提交的东西）；
  // 本机未跟踪的临时目录只提示，不判失败。
  const tracked = new Set(
    git(['ls-files']).split(/\r?\n/).filter(Boolean).map((p) => p.split('/')[0]),
  );
  const unknown = [...tracked].filter((n) => !ALLOWED_TOP_LEVEL.has(n));
  if (unknown.length) {
    fail(
      `顶层出现未登记的跟踪条目：${unknown.join(', ')}\n` +
        '        新增顶层目录/文件必须同时更新 scripts/verify-structure.mjs 的 ALLOWED_TOP_LEVEL，' +
        '并在 docs/directory-guide.md 里登记（见 docs/directory-guide.md §4）。',
    );
  } else {
    ok(`${tracked.size} 个顶层跟踪条目全部在白名单内`);
  }

  const localOnly = readdirSync(ROOT, { withFileTypes: true })
    .map((e) => e.name)
    .filter((n) => n !== '.git' && !tracked.has(n));
  if (localOnly.length) {
    note(`本机未跟踪条目（不参与校验）：${localOnly.join(', ')}`);
  }
}

/* --------------------------------------------------------- 2. .gitmodules */

section('2. .gitmodules 解析');
let gitmodules = [];
{
  const file = join(ROOT, '.gitmodules');
  if (!existsSync(file)) {
    fail('.gitmodules 不存在，但本仓库应当挂载协议与范例仓库');
  } else {
    let cur = null;
    for (const raw of readFileSync(file, 'utf8').split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith('#') || line.startsWith(';')) continue;
      const head = /^\[submodule\s+"(.+)"\]$/.exec(line);
      if (head) {
        cur = { name: head[1], path: null, url: null };
        gitmodules.push(cur);
        continue;
      }
      const kv = /^([A-Za-z0-9_.-]+)\s*=\s*(.*)$/.exec(line);
      if (kv && cur) cur[kv[1]] = kv[2].trim();
    }
    const broken = gitmodules.filter((s) => !s.path || !s.url);
    if (broken.length) {
      fail(`.gitmodules 条目缺少 path/url：${broken.map((s) => s.name).join(', ')}`);
    } else {
      ok(`解析出 ${gitmodules.length} 个挂载`);
    }
  }
}

// 归档区（old/）的挂载是历史遗留，只读保留，不参与现行索引。
const archivedMounts = gitmodules.filter((s) => s.path?.startsWith('old/'));
const liveMounts = gitmodules.filter((s) => !s.path?.startsWith('old/'));
if (archivedMounts.length) {
  note(`归档区挂载（不参与索引校验）：${archivedMounts.map((s) => s.path).join(', ')}`);
}

/* ------------------------------------------------------------ 3. registry */

section('3. registry 索引文档');
const STATUS = ['Draft', 'Experimental', 'Candidate', 'Stable', 'Deprecated'];
const CATEGORY_PREFIX = {
  'meta-protocol': 'vendor/meta-protocols/',
  'sub-protocol': 'vendor/sub-protocols/',
  example: 'vendor/examples/',
};
const ID_PATTERN = /^[a-z0-9][a-z0-9-]*$/;
const UPSTREAM_PATTERN = /^https:\/\/github\.com\/[^/]+\/[^/]+\.git$/;

const REQUIRED = {
  protocols: ['id', 'displayName', 'category', 'scope', 'status', 'upstream', 'maintainer', 'mount'],
  implementations: [
    'id',
    'displayName',
    'category',
    'role',
    'implements',
    'status',
    'upstream',
    'maintainer',
    'mount',
    'doc',
  ],
  profiles: ['id', 'displayName', 'category', 'scope', 'status', 'owner', 'doc'],
};

const docs = {};
for (const name of ['protocols', 'implementations', 'profiles']) {
  const file = join(ROOT, 'registry', `${name}.json`);
  if (!existsSync(file)) {
    fail(`registry/${name}.json 不存在`);
    continue;
  }
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(file, 'utf8'));
  } catch (err) {
    fail(`registry/${name}.json 不是合法 JSON：${err.message}`);
    continue;
  }
  docs[name] = parsed;

  if (parsed.$schema !== './schema/index.schema.json') {
    fail(`registry/${name}.json 的 $schema 必须是 "./schema/index.schema.json"`);
  }
  if (parsed.document !== name) {
    fail(`registry/${name}.json 的 document 字段应为 "${name}"，实际为 "${parsed.document}"`);
  }
  if (parsed.version !== 1) fail(`registry/${name}.json 的 version 必须为 1`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(parsed.updated ?? '')) {
    fail(`registry/${name}.json 的 updated 必须是 YYYY-MM-DD`);
  }
  if (typeof parsed.scope !== 'string' || !parsed.scope) {
    fail(`registry/${name}.json 缺少 scope`);
  }
  if (!Array.isArray(parsed.entries)) {
    fail(`registry/${name}.json 的 entries 必须是数组`);
    continue;
  }

  const seen = new Set();
  parsed.entries.forEach((entry, i) => {
    const where = `registry/${name}.json entries[${i}]`;
    for (const field of REQUIRED[name]) {
      if (entry[field] === undefined) fail(`${where} 缺少字段 ${field}`);
    }
    if (entry.id !== undefined) {
      if (!ID_PATTERN.test(entry.id)) fail(`${where} id "${entry.id}" 必须匹配 ${ID_PATTERN}`);
      if (seen.has(entry.id)) fail(`${where} id "${entry.id}" 重复`);
      seen.add(entry.id);
    }
    if (entry.status !== undefined && !STATUS.includes(entry.status)) {
      fail(`${where} status "${entry.status}" 不在状态词表内`);
    }
    if (entry.statusSource !== undefined && entry.statusSource !== 'upstream') {
      fail(`${where} statusSource 必须是 "upstream"（索引不发明状态）`);
    }
    if (entry.upstream !== undefined && !UPSTREAM_PATTERN.test(entry.upstream)) {
      fail(`${where} upstream "${entry.upstream}" 必须是 GitHub 仓库地址并以 .git 结尾`);
    }
    if (entry.doc !== undefined && !existsSync(join(ROOT, entry.doc))) {
      fail(`${where} doc "${entry.doc}" 不存在`);
    }

    // 类别 → 挂载路径前缀
    const prefix = CATEGORY_PREFIX[entry.category];
    if (name === 'profiles') {
      if (entry.category !== 'profile') fail(`${where} category 必须是 "profile"`);
      if (entry.mount !== undefined) fail(`${where} Profile 条目不应有 mount 字段`);
    } else if (!prefix) {
      fail(`${where} category "${entry.category}" 不是合法类别`);
    } else {
      const expected = `${prefix}${entry.id}`;
      if (entry.mount !== expected) {
        fail(`${where} category "${entry.category}" 的挂载路径必须是 "${expected}"，实际为 "${entry.mount}"`);
      }
    }

    if (name === 'protocols' && entry.category === 'sub-protocol' && !entry.buildsOn) {
      fail(`${where} 子协议条目必须写 buildsOn（它依托的元协议 id）`);
    }
  });

  ok(`${name}.json：${parsed.entries.length} 条，字段与类别前缀合法`);
}

/* ------------------------------------------- 4. 索引 ↔ .gitmodules ↔ gitlink */

section('4. 索引与挂载双向一致');
const registered = [];
const mountRoots = [];
{
  for (const [name, doc] of Object.entries(docs)) {
    for (const entry of doc.entries ?? []) {
      if (entry.mount) registered.push({ doc: name, ...entry });
    }
  }
  mountRoots.push(...registered.map((e) => e.mount));

  // 4a. 每条索引的 mount 必须在 .gitmodules 里，且是 gitlink
  for (const entry of registered) {
    const mod = liveMounts.find((s) => s.path === entry.mount);
    if (!mod) {
      fail(`索引条目 ${entry.id} 的 mount "${entry.mount}" 不在 .gitmodules 中`);
      continue;
    }
    if (mod.url !== entry.upstream) {
      fail(
        `索引条目 ${entry.id} 的 upstream "${entry.upstream}" 与 .gitmodules 的 url "${mod.url}" 不一致`,
      );
    }
    let lsFiles = '';
    try {
      lsFiles = git(['ls-files', '-s', '--', entry.mount]);
    } catch {
      lsFiles = '';
    }
    const line = lsFiles.split(/\r?\n/).filter(Boolean)[0] ?? '';
    const mode = line.split(/\s+/)[0];
    if (mode !== '160000') {
      fail(`索引条目 ${entry.id} 的 mount "${entry.mount}" 不是 gitlink（mode ${mode || '缺失'}）`);
    }
  }

  // 4b. 每个现行挂载必须被索引登记
  for (const mod of liveMounts) {
    if (!registered.some((e) => e.mount === mod.path)) {
      fail(`.gitmodules 中的挂载 "${mod.path}" 没有 registry 索引条目`);
    }
  }

  ok(`${registered.length} 条索引与 ${liveMounts.length} 个现行挂载双向匹配`);

  // 4c. vendor/ 下不得有未登记的跟踪文件
  const vendorTracked = git(['ls-files', '--', 'vendor'])
    .split(/\r?\n/)
    .filter(Boolean);
  const mountPaths = new Set(registered.map((e) => e.mount));
  for (const path of vendorTracked) {
    if (mountPaths.has(path)) continue;
    const insideMount = [...mountPaths].some((m) => path.startsWith(`${m}/`));
    if (insideMount) {
      fail(`vendor/ 内出现了挂在挂载点里的本仓库文件：${path}`);
      continue;
    }
    if (path.endsWith('README.md')) continue;
    fail(`vendor/ 下存在未登记的文件：${path}（只允许挂载点与各层 README.md）`);
  }
  ok(`vendor/ 下 ${vendorTracked.length} 个跟踪条目均为挂载点或说明文件`);
}

/* 挂载是否已在本地初始化（未初始化时，指向挂载内部的链接只提示不判失败） */
function mountOf(path) {
  return mountRoots.find((m) => path === m || path.startsWith(`${m}/`)) ?? null;
}
function mountInitialized(mount) {
  const dir = join(ROOT, mount);
  if (!existsSync(dir)) return false;
  try {
    return readdirSync(dir).length > 0;
  } catch {
    return false;
  }
}

/* ------------------------------------------------ 5. 文档相对链接可解析 */

section('5. Markdown 相对链接');
{
  const skipDirs = ['old', '.git', 'node_modules'];
  const mdFiles = [];

  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      const relPath = rel(relative(ROOT, full));
      if (skipDirs.some((d) => relPath === d || relPath.startsWith(`${d}/`))) continue;
      if (mountOf(relPath)) continue;
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.md')) mdFiles.push(full);
    }
  };
  walk(ROOT);

  const linkPattern = /!?\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  let checked = 0;
  let skipped = 0;
  let broken = 0;

  for (const file of mdFiles) {
    const text = readFileSync(file, 'utf8');
    for (const match of text.matchAll(linkPattern)) {
      let target = match[1].trim();
      if (/^(https?:|mailto:|#)/i.test(target)) continue;
      target = target.split('#')[0].split('?')[0];
      if (!target) continue;
      try {
        target = decodeURIComponent(target);
      } catch {
        /* 保留原样 */
      }
      const resolved = resolve(dirname(file), target);
      const resolvedRel = rel(relative(ROOT, resolved));
      const mount = mountOf(resolvedRel);
      if (mount && !mountInitialized(mount)) {
        skipped += 1;
        continue;
      }
      checked += 1;
      if (!existsSync(resolved)) {
        broken += 1;
        fail(`链接失效：${rel(relative(ROOT, file))} → ${match[1]}`);
      }
    }
  }
  if (skipped) note(`指向未初始化挂载的链接跳过 ${skipped} 个（在 mounts job 中会深校验）`);
  if (!broken) ok(`${mdFiles.length} 个文档中的 ${checked} 个相对链接全部可解析`);
}

/* ------------------------------------------------------- 6. 索引里的规范入口 */

section('6. 挂载内规范入口');
{
  for (const entry of registered) {
    if (!entry.specEntry) continue;
    if (!mountInitialized(entry.mount)) {
      note(`挂载 ${entry.mount} 未初始化，跳过 specEntry 检查`);
      continue;
    }
    if (!existsSync(join(ROOT, entry.mount, entry.specEntry))) {
      fail(`索引条目 ${entry.id} 的 specEntry "${entry.specEntry}" 在挂载中不存在`);
    }
  }
  ok('已检查可用的 specEntry');
}

/* --------------------------------------------------------------- 汇总 */

console.log('\n————————————————————————————————————————');
if (notes.length) {
  console.log('提示：');
  for (const n of notes) console.log(`  · ${n}`);
}
if (failures.length) {
  console.log(`\n✗ 结构校验失败：${failures.length} 项`);
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
console.log('\n✓ 结构校验通过：目录、索引、挂载与文档链接一致');
