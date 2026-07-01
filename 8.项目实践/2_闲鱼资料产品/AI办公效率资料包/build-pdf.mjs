import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const outDir = path.join(root, 'dist');
fs.mkdirSync(outDir, { recursive: true });

const documents = [
  { title: '普通人办公效率模板手册', file: 'AI办公效率手册-正文.md' },
  { title: '提问模板速查表', file: 'AI提示词速查表.md' },
];

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
  if (codeOpen) {
    html += `<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>\n`;
  }
  return html;
}

const generatedAt = new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'Asia/Shanghai',
  dateStyle: 'medium',
  timeStyle: 'medium',
  hour12: false,
}).format(new Date());

const body = documents.map((doc, index) => {
  const content = fs.readFileSync(path.join(root, doc.file), 'utf8');
  return `<section class="${index === 0 ? 'main-doc' : 'appendix'}" data-source="${escapeHtml(doc.file)}">\n${renderMarkdown(content)}\n</section>`;
}).join('\n');

const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>普通人办公效率模板手册</title>
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
  .cover .eyebrow {
    font-size: 15px;
    color: #57606a;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 18px;
  }
  .cover h1 {
    font-size: 42px;
    line-height: 1.18;
    border: 0;
    margin: 0 0 16px;
    padding: 0;
  }
  .cover .subtitle {
    font-size: 20px;
    color: #57606a;
    margin-bottom: 34px;
  }
  .cover .meta {
    border: 1px solid #d8dee4;
    border-radius: 8px;
    padding: 16px 18px;
    color: #57606a;
    background: #f6f8fa;
  }
  h1, h2, h3, h4 {
    line-height: 1.35;
    color: #111827;
    break-after: avoid;
  }
  h1 {
    font-size: 28px;
    margin: 0 0 18px;
    padding-bottom: 10px;
    border-bottom: 1px solid #d8dee4;
  }
  h2 { font-size: 21px; margin: 30px 0 12px; }
  h3 { font-size: 17px; margin: 22px 0 10px; }
  h4 { font-size: 15px; margin: 18px 0 8px; }
  p { margin: 0 0 12px; }
  ul, ol { margin: 0 0 14px 1.2em; padding-left: 1.2em; }
  li { margin: 4px 0; }
  a { color: #0759b8; text-decoration: none; }
  em { color: #57606a; }
  code {
    font-family: Consolas, "SFMono-Regular", monospace;
    background: #f6f8fa;
    border-radius: 4px;
    padding: 0.1em 0.35em;
  }
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
  pre code {
    padding: 0;
    background: transparent;
    font-size: 12.5px;
    line-height: 1.55;
  }
  hr { border: 0; border-top: 1px solid #d8dee4; margin: 22px 0; }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 14px 0 18px;
    font-size: 13.5px;
    break-inside: avoid;
  }
  th, td {
    border: 1px solid #d8dee4;
    padding: 8px 9px;
    vertical-align: top;
  }
  th { background: #f6f8fa; font-weight: 700; }
  .main-doc > h1:first-child { margin-top: 0; }
  .appendix { page-break-before: always; }
  @media print {
    body { max-width: none; }
  }
</style>
</head>
<body>
<section class="cover">
  <div class="eyebrow">Original PDF Template Pack</div>
  <h1>普通人办公效率模板手册</h1>
  <div class="subtitle">智能办公工具提问方法与高频场景模板</div>
  <div class="meta">
    <p><strong>版本：</strong>V1.0</p>
    <p><strong>内容：</strong>主手册 + 提示词速查表</p>
    <p><strong>声明：</strong>原创整理，仅作学习参考；不售卖账号，不提供软件，不承诺收益。</p>
    <p><strong>生成时间：</strong>${escapeHtml(generatedAt)}</p>
  </div>
</section>
${body}
</body>
</html>`;

const htmlPath = path.join(outDir, 'ai-office-manual.html');
const pdfPath = path.join(outDir, 'ai-office-manual.pdf');
fs.writeFileSync(htmlPath, html, 'utf8');

const edgeCandidates = [
  path.join(process.env['ProgramFiles(x86)'] || '', 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
  path.join(process.env.ProgramFiles || '', 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
  path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
].filter(Boolean);
const edgePath = edgeCandidates.find((candidate) => fs.existsSync(candidate));

if (!edgePath) {
  throw new Error(`Microsoft Edge was not found. HTML generated at: ${htmlPath}`);
}

const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'edge-print-'));
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
  try {
    fs.rmSync(profileDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
  } catch {
    // Edge can keep a temporary profile handle alive briefly after printing.
  }
}

const htmlStat = fs.statSync(htmlPath);
const pdfStat = fs.statSync(pdfPath);
console.log(JSON.stringify({
  htmlPath,
  htmlBytes: htmlStat.size,
  pdfPath,
  pdfBytes: pdfStat.size,
}, null, 2));
