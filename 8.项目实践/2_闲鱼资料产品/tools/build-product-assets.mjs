import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const repoRoot = process.cwd();
const args = process.argv.slice(2);

if (!args.length) {
  console.error('Usage: node tools/build-product-assets.mjs <product-dir> [product-dir...]');
  process.exit(1);
}

const edgeCandidates = [
  path.join(process.env['ProgramFiles(x86)'] || '', 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
  path.join(process.env.ProgramFiles || '', 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
  path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
].filter(Boolean);
const edgePath = edgeCandidates.find((candidate) => fs.existsSync(candidate));

if (!edgePath) {
  throw new Error('Microsoft Edge was not found; cannot render PDF or PNG assets.');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderInline(raw) {
  let text = escapeHtml(raw);
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, '$1<em>$2</em>');
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, href) => {
    return `<a href="${escapeHtml(href)}">${label}</a>`;
  });
  return text;
}

function splitTableRow(line) {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());
}

function isTableSeparator(line) {
  const cells = splitTableRow(line);
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function renderTable(lines) {
  if (lines.length < 2 || !isTableSeparator(lines[1])) {
    return '<p>' + lines.map((line) => renderInline(line.trim())).join('<br>') + '</p>\n';
  }
  const headers = splitTableRow(lines[0]);
  const rows = lines.slice(2).map(splitTableRow);
  const thead = '<thead><tr>' + headers.map((cell) => `<th>${renderInline(cell)}</th>`).join('') + '</tr></thead>';
  const tbody = '<tbody>' + rows.map((row) => '<tr>' + row.map((cell) => `<td>${renderInline(cell)}</td>`).join('') + '</tr>').join('') + '</tbody>';
  return `<table>${thead}${tbody}</table>\n`;
}

function renderMarkdown(markdown) {
  const lines = markdown.split(/\r?\n/);
  let html = '';
  let paragraph = [];
  let table = [];
  let listOpen = null;
  let codeOpen = false;
  let codeLines = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    html += `<p>${renderInline(paragraph.join(' '))}</p>\n`;
    paragraph = [];
  };
  const flushTable = () => {
    if (!table.length) return;
    html += renderTable(table);
    table = [];
  };
  const closeList = () => {
    if (!listOpen) return;
    html += `</${listOpen}>\n`;
    listOpen = null;
  };
  const flushAll = () => {
    flushParagraph();
    flushTable();
    closeList();
  };

  for (const line of lines) {
    if (/^```/.test(line.trim())) {
      flushAll();
      if (!codeOpen) {
        codeOpen = true;
        codeLines = [];
      } else {
        html += `<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>\n`;
        codeOpen = false;
        codeLines = [];
      }
      continue;
    }

    if (codeOpen) {
      codeLines.push(line);
      continue;
    }

    if (!line.trim()) {
      flushAll();
      continue;
    }

    if (/^\|.*\|\s*$/.test(line.trim())) {
      flushParagraph();
      closeList();
      table.push(line);
      continue;
    }
    flushTable();

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flushAll();
      const level = heading[1].length;
      html += `<h${level}>${renderInline(heading[2].trim())}</h${level}>\n`;
      continue;
    }

    if (/^[-*_]{3,}\s*$/.test(line.trim())) {
      flushAll();
      html += '<hr>\n';
      continue;
    }

    const unordered = line.match(/^\s*[-*+]\s+(.+)$/);
    if (unordered) {
      flushParagraph();
      if (listOpen !== 'ul') {
        closeList();
        html += '<ul>\n';
        listOpen = 'ul';
      }
      html += `<li>${renderInline(unordered[1].trim())}</li>\n`;
      continue;
    }

    const ordered = line.match(/^\s*\d+\.\s+(.+)$/);
    if (ordered) {
      flushParagraph();
      if (listOpen !== 'ol') {
        closeList();
        html += '<ol>\n';
        listOpen = 'ol';
      }
      html += `<li>${renderInline(ordered[1].trim())}</li>\n`;
      continue;
    }

    closeList();
    paragraph.push(line.trim());
  }

  flushAll();
  if (codeOpen) html += `<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>\n`;
  return html;
}

function readConfig(productDir) {
  const configPath = path.join(productDir, 'product.json');
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

function generatedAt() {
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    dateStyle: 'medium',
    timeStyle: 'medium',
    hour12: false,
  }).format(new Date());
}

function cleanupTempDir(target) {
  try {
    fs.rmSync(target, {
      recursive: true,
      force: true,
      maxRetries: 8,
      retryDelay: 200,
    });
  } catch (error) {
    console.warn(`Warning: could not remove temp directory ${target}: ${error.message}`);
  }
}

function pdfHtml(config, productDir) {
  const body = config.docs.map((doc, index) => {
    const content = fs.readFileSync(path.join(productDir, doc.file), 'utf8');
    return `<section class="${index === 0 ? 'main-doc' : 'appendix'}" data-source="${escapeHtml(doc.file)}">\n${renderMarkdown(content)}\n</section>`;
  }).join('\n');

  const pills = (config.coverPills || []).map((item) => `<span>${escapeHtml(item)}</span>`).join('');

  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>${escapeHtml(config.title)}</title>
<style>
  @page { size: A4; margin: 16mm 14mm 18mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0 auto;
    max-width: 880px;
    color: #1f2328;
    background: #fff;
    font-family: "Microsoft YaHei", "Noto Sans CJK SC", "Source Han Sans SC", Arial, sans-serif;
    font-size: 14.5px;
    line-height: 1.7;
  }
  .cover {
    min-height: 240mm;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-bottom: 1px solid #d8dee4;
    page-break-after: always;
  }
  .eyebrow {
    font-size: 15px;
    color: #57606a;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 18px;
  }
  .cover h1 {
    font-size: 41px;
    line-height: 1.18;
    border: 0;
    margin: 0 0 16px;
    padding: 0;
  }
  .subtitle {
    font-size: 20px;
    color: #57606a;
    margin-bottom: 26px;
  }
  .pills { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 26px; }
  .pills span {
    display: inline-flex;
    border: 1px solid #d8dee4;
    border-radius: 999px;
    padding: 6px 12px;
    background: #f6f8fa;
    font-weight: 700;
  }
  .meta {
    border: 1px solid #d8dee4;
    border-radius: 8px;
    padding: 16px 18px;
    color: #57606a;
    background: #f6f8fa;
  }
  h1, h2, h3, h4 { line-height: 1.35; color: #111827; break-after: avoid; }
  h1 { font-size: 28px; margin: 0 0 18px; padding-bottom: 10px; border-bottom: 1px solid #d8dee4; }
  h2 { font-size: 21px; margin: 30px 0 12px; }
  h3 { font-size: 17px; margin: 22px 0 10px; }
  h4 { font-size: 15px; margin: 18px 0 8px; }
  p { margin: 0 0 12px; }
  ul, ol { margin: 0 0 14px 1.2em; padding-left: 1.2em; }
  li { margin: 4px 0; }
  a { color: #0759b8; text-decoration: none; }
  em { color: #57606a; }
  code { font-family: Consolas, "SFMono-Regular", monospace; background: #f6f8fa; border-radius: 4px; padding: 0.1em 0.35em; }
  pre {
    margin: 12px 0 16px;
    padding: 12px 14px;
    background: #f6f8fa;
    border: 1px solid #d8dee4;
    border-radius: 6px;
    white-space: pre-wrap;
    word-break: break-word;
    break-inside: avoid;
  }
  pre code { padding: 0; background: transparent; font-size: 12.5px; line-height: 1.55; }
  hr { border: 0; border-top: 1px solid #d8dee4; margin: 22px 0; }
  table { width: 100%; border-collapse: collapse; margin: 14px 0 18px; font-size: 13.5px; break-inside: avoid; }
  th, td { border: 1px solid #d8dee4; padding: 8px 9px; vertical-align: top; }
  th { background: #f6f8fa; font-weight: 700; }
  .main-doc > h1:first-child { margin-top: 0; }
  .appendix { page-break-before: always; }
  @media print { body { max-width: none; } }
</style>
</head>
<body>
<section class="cover">
  <div class="eyebrow">Original PDF Template Pack</div>
  <h1>${escapeHtml(config.title)}</h1>
  <div class="subtitle">${escapeHtml(config.subtitle)}</div>
  <div class="pills">${pills}</div>
  <div class="meta">
    <p><strong>版本：</strong>${escapeHtml(config.version || 'V1.0')}</p>
    <p><strong>内容：</strong>${escapeHtml(config.deliverySummary)}</p>
    <p><strong>声明：</strong>${escapeHtml(config.disclaimer)}</p>
    <p><strong>生成时间：</strong>${escapeHtml(generatedAt())}</p>
  </div>
</section>
${body}
</body>
</html>`;
}

function listingFrame(config, card) {
  const footer = card.footer || config.imageFooter || '原创整理｜模板清晰｜边界明确';
  const badge = card.badge || config.imageBadge || 'PDF + 模板';
  const theme = config.theme || {};
  const accent = theme.accent || '#ffe15a';
  const soft = theme.soft || '#eef6ff';

  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>${escapeHtml(card.title)}</title>
<style>
  * { box-sizing: border-box; }
  html, body { width: 1080px; height: 1080px; margin: 0; overflow: hidden; }
  body {
    font-family: "Microsoft YaHei", "Noto Sans CJK SC", "Source Han Sans SC", Arial, sans-serif;
    color: #111827;
    background:
      radial-gradient(circle at 92% 8%, rgba(37, 99, 235, 0.12), transparent 260px),
      linear-gradient(135deg, #fff8d6 0%, #ffffff 42%, ${soft} 100%);
  }
  .sheet { position: relative; width: 100%; height: 100%; padding: 58px 62px 54px; }
  .topline { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
  .brand { display: inline-flex; align-items: center; gap: 12px; font-size: 25px; font-weight: 900; }
  .brand-mark { min-width: 46px; height: 46px; display: grid; place-items: center; border-radius: 14px; background: #111827; color: ${accent}; font-size: 22px; padding: 0 9px; }
  .tagline { font-size: 21px; color: #4b5563; font-weight: 800; }
  h1 { margin: 0 0 18px; max-width: 920px; font-size: 66px; line-height: 1.08; letter-spacing: 0; }
  .subtitle { max-width: 900px; margin-bottom: 34px; font-size: 30px; line-height: 1.35; color: #374151; font-weight: 800; }
  .pills { display: flex; flex-wrap: wrap; gap: 14px; margin: 8px 0 32px; }
  .pill { display: inline-flex; align-items: center; min-height: 48px; padding: 10px 18px; border-radius: 999px; font-size: 22px; font-weight: 900; border: 2px solid #111827; }
  .dark { background: #111827; color: #ffffff; }
  .accent { background: ${accent}; color: #111827; }
  .blue { background: #dbeafe; color: #1d4ed8; border-color: #93c5fd; }
  .green { background: #dcfce7; color: #047857; border-color: #86efac; }
  .panel { border: 3px solid #111827; border-radius: 22px; background: rgba(255,255,255,0.92); box-shadow: 12px 12px 0 #111827; padding: 28px; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; }
  .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
  .mini { min-height: 128px; border-radius: 18px; background: #f9fafb; border: 2px solid #d1d5db; padding: 20px; }
  .mini strong { display: block; margin-bottom: 8px; font-size: 26px; }
  .mini span { font-size: 21px; line-height: 1.36; color: #4b5563; }
  .list { display: grid; gap: 15px; }
  .line { display: flex; align-items: flex-start; gap: 14px; font-size: 28px; line-height: 1.32; font-weight: 900; }
  .num, .check { flex: 0 0 auto; width: 42px; height: 42px; display: grid; place-items: center; border-radius: 13px; background: ${accent}; border: 2px solid #111827; font-size: 22px; font-weight: 900; }
  .check { background: #dcfce7; color: #047857; }
  .prompt-box { border: 2px solid #d1d5db; border-radius: 18px; background: #f8fafc; padding: 18px; }
  .prompt-title { margin-bottom: 12px; font-size: 24px; font-weight: 900; color: #1d4ed8; }
  pre { margin: 0; white-space: pre-wrap; font-family: Consolas, "Microsoft YaHei", monospace; font-size: 20px; line-height: 1.45; color: #1f2937; }
  .mock { position: relative; min-height: 360px; overflow: hidden; }
  .doc-page { position: absolute; width: 300px; height: 390px; border: 2px solid #111827; border-radius: 16px; background: #ffffff; box-shadow: 8px 8px 0 rgba(17,24,39,0.18); padding: 22px; }
  .doc-page:nth-child(1) { left: 22px; top: 26px; transform: rotate(-4deg); }
  .doc-page:nth-child(2) { left: 314px; top: 2px; transform: rotate(2deg); }
  .doc-page:nth-child(3) { left: 606px; top: 48px; transform: rotate(-1deg); }
  .doc-title { height: 24px; width: 78%; border-radius: 8px; background: #111827; margin-bottom: 22px; }
  .doc-line { height: 12px; border-radius: 999px; background: #d1d5db; margin-bottom: 12px; }
  .doc-line.short { width: 68%; }
  .doc-callout { margin-top: 22px; padding: 14px; border-radius: 12px; background: #fff8d6; border: 2px solid #facc15; font-size: 19px; font-weight: 900; }
  .footer { position: absolute; left: 62px; right: 62px; bottom: 38px; display: flex; justify-content: space-between; align-items: center; color: #4b5563; font-size: 20px; font-weight: 800; }
  .badge { padding: 10px 16px; border-radius: 14px; color: #111827; background: ${accent}; border: 2px solid #111827; font-weight: 900; }
</style>
</head>
<body>
<main class="sheet">
  <div class="topline">
    <div class="brand"><div class="brand-mark">${escapeHtml(config.imageMark || 'PDF')}</div><span>${escapeHtml(config.imageBrand || config.title)}</span></div>
    <div class="tagline">${escapeHtml(config.imageTagline || '新手也能直接套用')}</div>
  </div>
  <h1>${escapeHtml(card.title)}</h1>
  <div class="subtitle">${escapeHtml(card.subtitle)}</div>
  ${listingBody(config, card)}
  <div class="footer"><span>${escapeHtml(footer)}</span><span class="badge">${escapeHtml(badge)}</span></div>
</main>
</body>
</html>`;
}

function pill(text, tone = 'dark') {
  return `<span class="pill ${tone}">${escapeHtml(text)}</span>`;
}

function listingBody(config, card) {
  if (card.type === 'cover') {
    const pills = (card.pills || config.coverPills || []).map((text, index) => {
      const tones = ['accent', 'dark', 'blue', 'green'];
      return pill(text, tones[index % tones.length]);
    }).join('');
    const labels = card.mockLabels || config.mockLabels || ['模板', '清单', '案例'];
    const pages = labels.slice(0, 3).map((label) => `<div class="doc-page">
      <div class="doc-title"></div>
      <div class="doc-line"></div><div class="doc-line"></div><div class="doc-line short"></div>
      <div class="doc-callout">${escapeHtml(label)}</div>
      <div class="doc-line"></div><div class="doc-line short"></div>
    </div>`).join('');
    return `<div class="pills">${pills}</div><div class="panel mock">${pages}</div>`;
  }

  if (card.type === 'list') {
    const items = card.items || [];
    const half = Math.ceil(items.length / 2);
    const columns = [items.slice(0, half), items.slice(half)];
    return `<div class="panel"><div class="grid-2">${columns.map((column) => `<div class="list">${column.map((item, index) => `<div class="line"><span class="num">${index + 1 + (column === columns[1] ? half : 0)}</span><span>${escapeHtml(item)}</span></div>`).join('')}</div>`).join('')}</div></div>`;
  }

  if (card.type === 'prompts') {
    const prompts = card.prompts || [];
    return `<div class="panel grid-2">${prompts.slice(0, 2).map((item) => `<div class="prompt-box"><div class="prompt-title">${escapeHtml(item.title)}</div><pre>${escapeHtml(item.content)}</pre></div>`).join('')}</div>`;
  }

  if (card.type === 'audience') {
    return `<div class="grid-3">${(card.items || []).slice(0, 6).map((item) => `<div class="mini"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.text)}</span></div>`).join('')}</div>`;
  }

  if (card.type === 'delivery') {
    const deliverables = card.deliverables || [];
    const boundaries = card.boundaries || [];
    return `<div class="panel"><div class="grid-2">
      <div class="list">${deliverables.map((item) => `<div class="line"><span class="check">✓</span><span>${escapeHtml(item)}</span></div>`).join('')}</div>
      <div class="list">${boundaries.map((item) => `<div class="line"><span class="num">!</span><span>${escapeHtml(item)}</span></div>`).join('')}</div>
    </div></div>`;
  }

  throw new Error(`Unknown listing card type: ${card.type}`);
}

function previewFrame(config, card, pageNo, totalPages) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>${escapeHtml(card.title)}</title>
<style>
  * { box-sizing: border-box; }
  html, body { width: 1080px; height: 1080px; margin: 0; overflow: hidden; }
  body {
    display: grid;
    place-items: center;
    font-family: "Microsoft YaHei", "Noto Sans CJK SC", "Source Han Sans SC", Arial, sans-serif;
    color: #1f2937;
    background: #e7e7e7;
  }
  .stage { width: 100%; height: 100%; padding: 42px 54px 46px; }
  .toolbar {
    width: 880px;
    height: 58px;
    margin: 0 auto 18px;
    padding: 0 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 10px;
    color: #4b5563;
    background: #f8fafc;
    border: 1px solid #d6d9df;
    box-shadow: 0 5px 18px rgba(15, 23, 42, 0.08);
    font-size: 18px;
  }
  .toolbar-left, .toolbar-right { display: flex; align-items: center; gap: 12px; white-space: nowrap; }
  .dot { width: 13px; height: 13px; border-radius: 999px; background: #cbd5e1; }
  .dot.dark { background: #64748b; }
  .file-name { color: #111827; font-weight: 700; }
  .paper {
    position: relative;
    width: 760px;
    height: 930px;
    margin: 0 auto;
    padding: 56px 62px 50px;
    background: #ffffff;
    border: 1px solid #d4d4d8;
    box-shadow: 0 18px 42px rgba(15, 23, 42, 0.2);
    overflow: hidden;
  }
  .clip-mark {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 8px;
    background: linear-gradient(90deg, #cbd5e1, #f8fafc, #cbd5e1);
  }
  .doc-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 28px;
    color: #6b7280;
    font-size: 15px;
  }
  .doc-meta strong { color: #111827; }
  h1 {
    margin: 0 0 12px;
    font-size: 38px;
    line-height: 1.24;
    color: #111827;
    letter-spacing: 0;
  }
  .subtitle {
    margin-bottom: 26px;
    font-size: 21px;
    line-height: 1.5;
    color: #4b5563;
  }
  h2 {
    margin: 22px 0 12px;
    padding-bottom: 8px;
    border-bottom: 2px solid #e5e7eb;
    font-size: 25px;
    color: #111827;
  }
  p { margin: 0 0 14px; font-size: 19px; line-height: 1.65; }
  ul, ol { margin: 8px 0 18px 26px; padding: 0; font-size: 18px; line-height: 1.55; }
  li { margin: 7px 0; }
  .toc { display: grid; gap: 9px; margin-top: 18px; }
  .toc-row {
    display: grid;
    grid-template-columns: 28px auto minmax(48px, 1fr) auto;
    align-items: baseline;
    gap: 10px;
    font-size: 18px;
    line-height: 1.35;
  }
  .toc-line { border-bottom: 1px dotted #cbd5e1; transform: translateY(-4px); }
  .toc-page { color: #6b7280; }
  pre {
    margin: 12px 0 18px;
    padding: 18px 20px;
    white-space: pre-wrap;
    border-radius: 8px;
    border: 1px solid #d1d5db;
    background: #f8fafc;
    color: #111827;
    font-family: Consolas, "Microsoft YaHei", monospace;
    font-size: 16px;
    line-height: 1.6;
  }
  table { width: 100%; border-collapse: collapse; margin: 12px 0 18px; font-size: 17px; line-height: 1.45; }
  td { border: 1px solid #d1d5db; padding: 11px 12px; vertical-align: top; }
  td:first-child { width: 112px; color: #111827; font-weight: 700; background: #f8fafc; }
  .note {
    margin: 15px 0 18px;
    padding: 14px 16px;
    border-left: 4px solid #64748b;
    background: #f8fafc;
    color: #374151;
    font-size: 17px;
    line-height: 1.55;
  }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .mini {
    border: 1px solid #d1d5db;
    border-radius: 8px;
    background: #f8fafc;
    padding: 12px 14px;
    min-height: 86px;
  }
  .mini strong { display: block; margin-bottom: 6px; font-size: 18px; color: #111827; }
  .mini span { display: block; font-size: 15.5px; line-height: 1.45; color: #4b5563; }
  .page-footer {
    position: absolute;
    left: 62px;
    right: 62px;
    bottom: 28px;
    display: flex;
    justify-content: space-between;
    color: #9ca3af;
    font-size: 14px;
    border-top: 1px solid #e5e7eb;
    padding-top: 12px;
  }
</style>
</head>
<body>
<main class="stage">
  <div class="toolbar">
    <div class="toolbar-left">
      <span class="dot dark"></span><span class="dot"></span><span class="dot"></span>
      <span class="file-name">${escapeHtml(config.title)}.pdf</span>
    </div>
    <div class="toolbar-right">
      <span>PDF 片段预览</span><span>${String(pageNo).padStart(2, '0')} / ${totalPages}</span>
    </div>
  </div>
  <article class="paper">
    <div class="clip-mark"></div>
    <div class="doc-meta"><span><strong>${escapeHtml(previewSection(card.type))}</strong></span><span>节选页 ${String(pageNo).padStart(2, '0')}</span></div>
    <h1>${escapeHtml(card.title)}</h1>
    <div class="subtitle">${escapeHtml(card.subtitle)}</div>
    ${previewBody(config, card)}
    <div class="page-footer"><span>原创整理学习参考</span><span>${String(pageNo).padStart(2, '0')}</span></div>
  </article>
</main>
</body>
</html>`;
}

function previewSection(type) {
  return {
    cover: '封面信息',
    list: '目录页',
    prompts: '模板页',
    audience: '场景页',
    delivery: '说明页',
  }[type] || '内容页';
}

function previewRows(rows) {
  return `<table>${rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}</table>`;
}

function previewList(items, ordered = false) {
  const tag = ordered ? 'ol' : 'ul';
  return `<${tag}>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</${tag}>`;
}

function previewCode(text) {
  return `<pre>${escapeHtml(text)}</pre>`;
}

function previewToc(items) {
  return `<div class="toc">${items.slice(0, 10).map((item, index) => (
    `<div class="toc-row"><span>${index + 1}</span><span>${escapeHtml(item)}</span><span class="toc-line"></span><span class="toc-page">${String((index + 1) * 3).padStart(2, '0')}</span></div>`
  )).join('')}</div>`;
}

function previewBody(config, card) {
  if (card.type === 'cover') {
    return `
      <p>${escapeHtml(config.subtitle)}</p>
      ${previewRows([
        ['版本', config.version || 'V1.0'],
        ['交付', config.deliverySummary || 'PDF 手册 + 模板'],
        ['适合', (config.coverPills || card.pills || []).slice(0, 4).join('、')],
        ['用途', '个人学习、资料整理、场景模板参考'],
      ])}
      <div class="note">资料为原创整理，仅作学习参考；请按个人真实情况填写、修改和核实。</div>
      <h2>内容节选</h2>
      ${previewList((card.pills || config.coverPills || []).slice(0, 5))}
    `;
  }

  if (card.type === 'list') {
    return previewToc(card.items || []);
  }

  if (card.type === 'prompts') {
    const prompts = card.prompts || [];
    return prompts.slice(0, 2).map((item) => `
      <h2>${escapeHtml(item.title)}</h2>
      ${previewCode(item.content)}
    `).join('');
  }

  if (card.type === 'audience') {
    return `<div class="grid">${(card.items || []).slice(0, 6).map((item) => `
      <div class="mini"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.text)}</span></div>
    `).join('')}</div>`;
  }

  if (card.type === 'delivery') {
    const imageBoundaries = card.imageBoundaries || [
      '只交付 PDF 文档和模板表',
      '模板需按个人真实情况填写',
      '具体效果因个人情况和执行不同',
      '涉及规则和专业事项请自行核实',
    ];
    return `
      <h2>交付内容</h2>
      ${previewList(card.deliverables || [])}
      <h2>使用边界</h2>
      ${previewList(imageBoundaries)}
      <div class="note">发布前建议把交付内容、适合人群和边界说明写清楚，减少误解。</div>
    `;
  }

  return `<p>${escapeHtml(card.subtitle || config.subtitle)}</p>`;
}

function renderPdf(config, productDir) {
  const outDir = path.join(productDir, 'dist');
  fs.mkdirSync(outDir, { recursive: true });
  const htmlPath = path.join(outDir, `${config.slug}.html`);
  const pdfPath = path.join(outDir, `${config.slug}.pdf`);
  fs.writeFileSync(htmlPath, pdfHtml(config, productDir), 'utf8');

  const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'edge-pdf-'));
  try {
    execFileSync(edgePath, [
      '--headless',
      '--disable-gpu',
      '--disable-extensions',
      '--no-first-run',
      `--user-data-dir=${profileDir}`,
      '--no-pdf-header-footer',
      `--print-to-pdf=${pdfPath}`,
      pathToFileURL(htmlPath).href,
    ], { stdio: 'inherit' });
  } finally {
    cleanupTempDir(profileDir);
  }

  return { htmlPath, pdfPath };
}

function renderImages(config, productDir) {
  const outputDir = path.join(productDir, '上架图片');
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'listing-images-'));
  fs.mkdirSync(outputDir, { recursive: true });
  const files = [];

  try {
    for (const [index, card] of config.listingImages.entries()) {
      const htmlPath = path.join(tmpDir, card.file.replace(/\.png$/i, '.html'));
      const pngPath = path.join(outputDir, card.file);
      fs.writeFileSync(htmlPath, previewFrame(config, card, index + 1, config.listingImages.length), 'utf8');
      const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'edge-shot-'));
      try {
        execFileSync(edgePath, [
          '--headless',
          '--disable-gpu',
          '--disable-extensions',
          '--no-first-run',
          `--user-data-dir=${profileDir}`,
          '--hide-scrollbars',
          '--force-device-scale-factor=1',
          '--window-size=1080,1080',
          `--screenshot=${pngPath}`,
          pathToFileURL(htmlPath).href,
        ], { stdio: 'inherit' });
      } finally {
        cleanupTempDir(profileDir);
      }
      files.push(pngPath);
    }
  } finally {
    cleanupTempDir(tmpDir);
  }

  return { outputDir, files };
}

for (const arg of args) {
  const productDir = path.resolve(repoRoot, arg);
  const config = readConfig(productDir);
  const pdf = renderPdf(config, productDir);
  const images = renderImages(config, productDir);
  console.log(JSON.stringify({
    productDir,
    title: config.title,
    pdf,
    images,
  }, null, 2));
}
