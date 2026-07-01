import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const outputDir = path.join(root, '上架图片');
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xianyu-listing-images-'));
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

function pill(text, tone = 'dark') {
  return `<span class="pill ${tone}">${escapeHtml(text)}</span>`;
}

function promptBox(title, content) {
  return `<div class="prompt-box"><div class="prompt-title">${escapeHtml(title)}</div><pre>${escapeHtml(content)}</pre></div>`;
}

function card(title, subtitle, body, footer = '原创整理｜不卖账号｜不承诺收益') {
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<style>
  * { box-sizing: border-box; }
  html, body { width: 1080px; height: 1080px; margin: 0; overflow: hidden; }
  body {
    font-family: "Microsoft YaHei", "Noto Sans CJK SC", "Source Han Sans SC", Arial, sans-serif;
    color: #111827;
    background:
      radial-gradient(circle at 92% 8%, rgba(37, 99, 235, 0.12), transparent 260px),
      linear-gradient(135deg, #fff8d6 0%, #ffffff 42%, #eef6ff 100%);
  }
  .sheet {
    position: relative;
    width: 100%;
    height: 100%;
    padding: 58px 62px 54px;
  }
  .topline {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
  }
  .brand {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    font-size: 25px;
    font-weight: 800;
  }
  .brand-mark {
    width: 46px;
    height: 46px;
    display: grid;
    place-items: center;
    border-radius: 14px;
    background: #111827;
    color: #ffe15a;
    font-size: 24px;
  }
  .tagline {
    font-size: 21px;
    color: #4b5563;
    font-weight: 700;
  }
  h1 {
    margin: 0 0 18px;
    max-width: 900px;
    font-size: 68px;
    line-height: 1.08;
    letter-spacing: 0;
  }
  .subtitle {
    max-width: 850px;
    margin-bottom: 34px;
    font-size: 31px;
    line-height: 1.35;
    color: #374151;
    font-weight: 700;
  }
  .pills { display: flex; flex-wrap: wrap; gap: 14px; margin: 8px 0 32px; }
  .pill {
    display: inline-flex;
    align-items: center;
    min-height: 48px;
    padding: 10px 18px;
    border-radius: 999px;
    font-size: 22px;
    font-weight: 800;
    border: 2px solid #111827;
  }
  .pill.dark { background: #111827; color: #ffffff; }
  .pill.yellow { background: #ffe15a; color: #111827; }
  .pill.blue { background: #dbeafe; color: #1d4ed8; border-color: #93c5fd; }
  .pill.green { background: #dcfce7; color: #047857; border-color: #86efac; }
  .panel {
    border: 3px solid #111827;
    border-radius: 22px;
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 12px 12px 0 #111827;
    padding: 28px;
  }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; }
  .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
  .mini {
    min-height: 128px;
    border-radius: 18px;
    background: #f9fafb;
    border: 2px solid #d1d5db;
    padding: 20px;
  }
  .mini strong { display: block; margin-bottom: 8px; font-size: 26px; }
  .mini span { font-size: 21px; line-height: 1.36; color: #4b5563; }
  .list { display: grid; gap: 15px; }
  .line {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    font-size: 28px;
    line-height: 1.32;
    font-weight: 800;
  }
  .num, .check {
    flex: 0 0 auto;
    width: 42px;
    height: 42px;
    display: grid;
    place-items: center;
    border-radius: 13px;
    background: #ffe15a;
    border: 2px solid #111827;
    font-size: 22px;
    font-weight: 900;
  }
  .check { background: #dcfce7; color: #047857; }
  .prompt-box {
    border: 2px solid #d1d5db;
    border-radius: 18px;
    background: #f8fafc;
    padding: 18px;
  }
  .prompt-title {
    margin-bottom: 12px;
    font-size: 24px;
    font-weight: 900;
    color: #1d4ed8;
  }
  pre {
    margin: 0;
    white-space: pre-wrap;
    font-family: Consolas, "Microsoft YaHei", monospace;
    font-size: 20px;
    line-height: 1.45;
    color: #1f2937;
  }
  .mock {
    position: relative;
    min-height: 360px;
    overflow: hidden;
  }
  .doc-page {
    position: absolute;
    width: 300px;
    height: 390px;
    border: 2px solid #111827;
    border-radius: 16px;
    background: #ffffff;
    box-shadow: 8px 8px 0 rgba(17, 24, 39, 0.18);
    padding: 22px;
  }
  .doc-page:nth-child(1) { left: 22px; top: 26px; transform: rotate(-4deg); }
  .doc-page:nth-child(2) { left: 314px; top: 2px; transform: rotate(2deg); }
  .doc-page:nth-child(3) { left: 606px; top: 48px; transform: rotate(-1deg); }
  .doc-title { height: 24px; width: 78%; border-radius: 8px; background: #111827; margin-bottom: 22px; }
  .doc-line { height: 12px; border-radius: 999px; background: #d1d5db; margin-bottom: 12px; }
  .doc-line.short { width: 68%; }
  .doc-callout {
    margin-top: 22px;
    padding: 14px;
    border-radius: 12px;
    background: #fff8d6;
    border: 2px solid #facc15;
    font-size: 19px;
    font-weight: 900;
  }
  .footer {
    position: absolute;
    left: 62px;
    right: 62px;
    bottom: 38px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #4b5563;
    font-size: 20px;
    font-weight: 700;
  }
  .badge {
    padding: 10px 16px;
    border-radius: 14px;
    color: #111827;
    background: #ffe15a;
    border: 2px solid #111827;
    font-weight: 900;
  }
</style>
</head>
<body>
<main class="sheet">
  <div class="topline">
    <div class="brand"><div class="brand-mark">AI</div><span>办公效率资料包</span></div>
    <div class="tagline">新手也能直接套用</div>
  </div>
  <h1>${escapeHtml(title)}</h1>
  <div class="subtitle">${escapeHtml(subtitle)}</div>
  ${body}
  <div class="footer"><span>${escapeHtml(footer)}</span><span class="badge">PDF + 模板</span></div>
</main>
</body>
</html>`;
}

const cards = [
  {
    file: '01-主图-AI办公效率手册.png',
    title: '普通人 AI 办公效率手册',
    subtitle: 'DeepSeek / ChatGPT 提示词模板，写文案、简历、周报、PPT 都能用',
    body: `
      <div class="pills">
        ${pill('100 条提示词', 'yellow')}
        ${pill('36 页 PDF', 'dark')}
        ${pill('原创整理', 'blue')}
        ${pill('复制即用', 'green')}
      </div>
      <div class="panel mock">
        <div class="doc-page">
          <div class="doc-title"></div>
          <div class="doc-line"></div><div class="doc-line"></div><div class="doc-line short"></div>
          <div class="doc-callout">写文案</div>
          <div class="doc-line"></div><div class="doc-line short"></div>
        </div>
        <div class="doc-page">
          <div class="doc-title"></div>
          <div class="doc-line"></div><div class="doc-line short"></div><div class="doc-line"></div>
          <div class="doc-callout">改简历</div>
          <div class="doc-line"></div><div class="doc-line"></div>
        </div>
        <div class="doc-page">
          <div class="doc-title"></div>
          <div class="doc-line"></div><div class="doc-line"></div><div class="doc-line short"></div>
          <div class="doc-callout">做周报</div>
          <div class="doc-line short"></div><div class="doc-line"></div>
        </div>
      </div>`,
  },
  {
    file: '02-内容目录预览.png',
    title: '一份资料覆盖高频场景',
    subtitle: '不讲复杂技术，重点给普通人可复制、可修改、可交付的模板',
    body: `
      <div class="panel">
        <div class="grid-2">
          <div class="list">
            <div class="line"><span class="num">1</span><span>写作：朋友圈、小红书、闲鱼详情</span></div>
            <div class="line"><span class="num">2</span><span>职场：日报、周报、邮件、会议纪要</span></div>
            <div class="line"><span class="num">3</span><span>求职：简历优化、JD 分析、面试准备</span></div>
            <div class="line"><span class="num">4</span><span>学习：笔记、总结、复习计划</span></div>
          </div>
          <div class="list">
            <div class="line"><span class="num">5</span><span>表格：Excel 公式、数据清洗</span></div>
            <div class="line"><span class="num">6</span><span>PPT：大纲、页面结构、演讲稿</span></div>
            <div class="line"><span class="num">7</span><span>闲鱼卖家：标题、客服、售后话术</span></div>
            <div class="line"><span class="num">8</span><span>附赠：提示词速查表</span></div>
          </div>
        </div>
      </div>`,
  },
  {
    file: '03-提示词模板预览.png',
    title: '模板不是摆设，是真的能复制',
    subtitle: '把括号里的内容替换成自己的信息，就能让 AI 输出更稳定',
    body: `
      <div class="panel grid-2">
        ${promptBox('通用万能模板', `你是一名【角色】。
我现在要完成【任务】。
背景是：【背景】。
请按照【格式】输出。
要求：不编造、不夸大。`)}
        ${promptBox('闲鱼详情模板', `商品：【名称/型号】
成色：【真实成色】
卖点：【3-5 个】
瑕疵：【提前说明】
请输出标题、详情、问答。`)}
      </div>`,
  },
  {
    file: '04-适合人群与使用场景.png',
    title: '适合想省时间的普通人',
    subtitle: '学生、职场新人、自由职业者、闲鱼卖家，都能从一个小场景开始用',
    body: `
      <div class="grid-3">
        <div class="mini"><strong>学生党</strong><span>整理笔记、复习计划、读书总结、错题分析</span></div>
        <div class="mini"><strong>职场人</strong><span>日报周报、会议纪要、邮件、PPT 大纲</span></div>
        <div class="mini"><strong>求职者</strong><span>简历优化、岗位匹配、面试问答准备</span></div>
        <div class="mini"><strong>闲鱼卖家</strong><span>商品标题、详情页、客服回复、售后说明</span></div>
        <div class="mini"><strong>内容创作者</strong><span>选题、标题、短视频脚本、改稿润色</span></div>
        <div class="mini"><strong>自由职业</strong><span>报价说明、交付文案、客户沟通模板</span></div>
      </div>`,
  },
  {
    file: '05-交付说明与边界.png',
    title: '交付清楚，边界也清楚',
    subtitle: '资料产品最怕说不清，这张图适合放最后一张减少误会',
    body: `
      <div class="panel">
        <div class="grid-2">
          <div class="list">
            <div class="line"><span class="check">✓</span><span>交付：PDF 手册 + 提示词速查表</span></div>
            <div class="line"><span class="check">✓</span><span>内容：办公、学习、求职、闲鱼卖家模板</span></div>
            <div class="line"><span class="check">✓</span><span>特点：原创整理、简单直接、适合新手</span></div>
          </div>
          <div class="list">
            <div class="line"><span class="num">!</span><span>不卖账号，不提供违规软件</span></div>
            <div class="line"><span class="num">!</span><span>不承诺收益，不提供代写作业</span></div>
            <div class="line"><span class="num">!</span><span>AI 输出内容请自行检查核实</span></div>
          </div>
        </div>
      </div>`,
  },
];

function renderPng(cardConfig) {
  const htmlPath = path.join(tmpDir, cardConfig.file.replace(/\.png$/i, '.html'));
  const pngPath = path.join(outputDir, cardConfig.file);
  fs.writeFileSync(htmlPath, card(cardConfig.title, cardConfig.subtitle, cardConfig.body), 'utf8');
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
  for (const item of cards) {
    renderPng(item);
  }
  console.log(JSON.stringify({
    outputDir,
    images: cards.map((item) => item.file),
  }, null, 2));
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
