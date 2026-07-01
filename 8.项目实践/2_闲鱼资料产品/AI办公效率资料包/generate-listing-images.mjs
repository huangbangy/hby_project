import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const outputDir = path.join(root, '上架图片');
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xianyu-pdf-excerpts-'));
fs.mkdirSync(outputDir, { recursive: true });

const edgeCandidates = [
  path.join(process.env['ProgramFiles(x86)'] || '', 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
  path.join(process.env.ProgramFiles || '', 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
  path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
].filter(Boolean);
const edgePath = edgeCandidates.find((candidate) => fs.existsSync(candidate));
if (!edgePath) {
  throw new Error('Microsoft Edge was not found; cannot render PNG listing images.');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function lines(items) {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
}

function codeBlock(text) {
  return `<pre>${escapeHtml(text)}</pre>`;
}

function table(rows) {
  return `<table>${rows.map((row) => (
    `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`
  )).join('')}</table>`;
}

function note(text) {
  return `<div class="note">${escapeHtml(text)}</div>`;
}

function page({ title, subtitle, pageNo, section, body }) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
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
  .stage {
    position: relative;
    width: 100%;
    height: 100%;
    padding: 42px 54px 46px;
  }
  .toolbar {
    height: 58px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 18px;
    margin: 0 auto 18px;
    width: 880px;
    border-radius: 10px;
    color: #4b5563;
    background: #f8fafc;
    border: 1px solid #d6d9df;
    box-shadow: 0 5px 18px rgba(15, 23, 42, 0.08);
    font-size: 18px;
  }
  .toolbar-left, .toolbar-right {
    display: flex;
    align-items: center;
    gap: 12px;
    white-space: nowrap;
  }
  .dot {
    width: 13px;
    height: 13px;
    border-radius: 999px;
    background: #cbd5e1;
  }
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
    margin-bottom: 28px;
    font-size: 21px;
    line-height: 1.5;
    color: #4b5563;
  }
  h2 {
    margin: 24px 0 14px;
    padding-bottom: 8px;
    border-bottom: 2px solid #e5e7eb;
    font-size: 25px;
    color: #111827;
    letter-spacing: 0;
  }
  h3 {
    margin: 20px 0 10px;
    font-size: 21px;
    color: #111827;
  }
  p {
    margin: 0 0 14px;
    font-size: 19px;
    line-height: 1.65;
  }
  ul, ol {
    margin: 8px 0 18px 26px;
    padding: 0;
    font-size: 18px;
    line-height: 1.55;
  }
  li { margin: 7px 0; }
  .toc {
    display: grid;
    gap: 9px;
    margin-top: 18px;
  }
  .toc-row {
    display: grid;
    grid-template-columns: 28px auto minmax(48px, 1fr) auto;
    align-items: baseline;
    gap: 10px;
    font-size: 18px;
    line-height: 1.35;
  }
  .toc-no { width: 24px; color: #6b7280; text-align: right; }
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
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0 18px;
    font-size: 17px;
    line-height: 1.45;
  }
  td {
    border: 1px solid #d1d5db;
    padding: 11px 12px;
    vertical-align: top;
  }
  td:first-child {
    width: 112px;
    color: #111827;
    font-weight: 700;
    background: #f8fafc;
  }
  .note {
    margin: 15px 0 18px;
    padding: 14px 16px;
    border-left: 4px solid #64748b;
    background: #f8fafc;
    color: #374151;
    font-size: 17px;
    line-height: 1.55;
  }
  .small {
    color: #6b7280;
    font-size: 16px;
    line-height: 1.55;
  }
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
      <span class="file-name">办公效率模板手册.pdf</span>
    </div>
    <div class="toolbar-right">
      <span>PDF 片段预览</span><span>${escapeHtml(pageNo)} / 5</span>
    </div>
  </div>
  <article class="paper">
    <div class="clip-mark"></div>
    <div class="doc-meta"><span><strong>${escapeHtml(section)}</strong></span><span>节选页 ${escapeHtml(pageNo)}</span></div>
    <h1>${escapeHtml(title)}</h1>
    <div class="subtitle">${escapeHtml(subtitle)}</div>
    ${body}
    <div class="page-footer"><span>个人学习参考资料</span><span>${escapeHtml(pageNo)}</span></div>
  </article>
</main>
</body>
</html>`;
}

function tocRow(no, title, pageNo) {
  return `<div class="toc-row"><span class="toc-no">${no}</span><span>${escapeHtml(title)}</span><span class="toc-line"></span><span class="toc-page">${pageNo}</span></div>`;
}

const pages = [
  {
    file: '01-主图-办公效率模板包.png',
    title: '普通人办公效率模板手册',
    subtitle: '智能办公工具提问方法与高频场景模板',
    pageNo: '01',
    section: '封面信息',
    body: `
      <p>这份资料不是写给技术人员看的，而是给普通人整理的办公提效手册。</p>
      ${table([
        ['版本', 'V1.0'],
        ['适合', '学生、职场新人、资料整理者、闲鱼卖家'],
        ['内容', '主手册、提问模板速查表、常见场景示例'],
        ['用途', '个人学习、办公提效、资料整理参考'],
      ])}
      ${note('核心思路：先把需求说清楚，再让工具帮你生成初稿、框架、清单或修改建议。')}
      <h2>目录节选</h2>
      <ul>
        ${lines([
          '提问的 5 个基本公式',
          '让输出少跑偏的 7 条规则',
          '写作、职场、求职、学习场景模板',
          'Excel、PPT、闲鱼卖家常用模板',
          '100 条可复制提问模板',
        ])}
      </ul>
    `,
  },
  {
    file: '02-内容目录预览.png',
    title: '目录',
    subtitle: '按真实使用场景整理，方便直接翻到需要的部分。',
    pageNo: '02',
    section: '目录页',
    body: `
      <div class="toc">
        ${tocRow('1', '这份手册适合谁', '03')}
        ${tocRow('2', '智能办公工具能帮普通人做什么', '05')}
        ${tocRow('3', '提问的 5 个基本公式', '07')}
        ${tocRow('4', '让输出少跑偏的 7 条规则', '11')}
        ${tocRow('5', '写作场景：朋友圈、笔记、商品描述', '15')}
        ${tocRow('6', '职场场景：日报、周报、邮件、纪要', '19')}
        ${tocRow('7', '求职场景：简历优化、岗位匹配', '22')}
        ${tocRow('8', '学习场景：读书笔记、课程总结', '25')}
        ${tocRow('9', '表格场景：公式、清洗、统计口径', '28')}
        ${tocRow('10', 'PPT 场景：大纲、结构、演讲稿', '30')}
      </div>
    `,
  },
  {
    file: '03-提问模板预览.png',
    title: '公式一：角色 + 任务 + 背景 + 输出格式',
    subtitle: '把括号里的内容替换成自己的真实信息，输出会更稳定。',
    pageNo: '03',
    section: '提问公式',
    body: `
      <h2>通用模板</h2>
      ${codeBlock(`你是一名【角色】。
我现在要完成【任务】。
背景是：【背景信息】。
请你按照【输出格式】给我结果。
要求：【限制条件】。`)}
      <h2>示例</h2>
      ${codeBlock(`你是一名有 5 年经验的电商文案策划。
我现在要写一条闲鱼商品详情。
商品是二手平板，成色 95 新，主要卖点是轻薄、适合学习记笔记。
请输出：标题 5 条、详情文案 1 版、买家常见问题回复 5 条。
要求：语气真实，不夸张，不承诺全新，不使用违禁词。`)}
      ${note('如果结果太空泛，通常是背景给得不够。可以继续补充成色、瑕疵、适合人群和交易边界。')}
    `,
  },
  {
    file: '04-适合人群与使用场景.png',
    title: '高频场景片段',
    subtitle: '从手册正文里截取几类常用场景，适合上架时展示内容密度。',
    pageNo: '04',
    section: '场景模板',
    body: `
      <h2>职场场景</h2>
      <p>把零散工作流水整理成日报或周报，分为今日完成、遇到问题、明日计划，语气正式但不僵硬。</p>
      <h2>求职场景</h2>
      <p>优化简历经历时，重点使用“负责什么 + 采取什么动作 + 使用什么方法 + 带来什么结果”的表达。</p>
      <h2>学习场景</h2>
      <p>读书笔记可以整理为核心观点、重要概念、可行动建议、我的应用场景和思考问题。</p>
      <h2>闲鱼卖家场景</h2>
      <p>详情页建议包含商品情况、真实卖点、瑕疵说明、适合人群、交易说明和售后边界。</p>
      ${note('这些片段适合让买家看到资料不是空标题，而是能直接复制修改的模板。')}
    `,
  },
  {
    file: '05-交付说明与边界.png',
    title: '交付说明与使用边界',
    subtitle: '上架最后一张建议放清楚交付内容和注意事项，减少误解。',
    pageNo: '05',
    section: '说明页',
    body: `
      ${table([
        ['交付内容', 'PDF 手册 + 提问模板速查表'],
        ['资料范围', '办公写作、学习整理、求职准备、闲鱼卖家常用模板'],
        ['使用方式', '复制模板后，替换括号里的个人信息，再根据实际情况修改'],
        ['注意事项', '内容用于学习参考，涉及事实、政策、价格、规则时请自行核实'],
      ])}
      <h2>边界说明</h2>
      <ul>
        ${lines([
          '只交付 PDF 文档和模板表，不包含其他交付内容。',
          '模板需要按个人情况补充真实信息。',
          '发布或交付前，请自行检查事实、语气和平台规则。',
          '不建议写“包学会”“包变现”“保证通过”等夸张表达。',
        ])}
      </ul>
      <p class="small">这张图的作用是提前说清楚资料内容，减少买家误会，也让商品页看起来更像真实文档预览。</p>
    `,
  },
];

function renderPng(pageConfig) {
  const htmlPath = path.join(tmpDir, pageConfig.file.replace(/\.png$/i, '.html'));
  const pngPath = path.join(outputDir, pageConfig.file);
  fs.writeFileSync(htmlPath, page(pageConfig), 'utf8');
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
    fs.rmSync(profileDir, { recursive: true, force: true });
  }
}

try {
  for (const item of pages) {
    renderPng(item);
  }
  console.log(JSON.stringify({
    outputDir,
    images: pages.map((item) => item.file),
  }, null, 2));
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
