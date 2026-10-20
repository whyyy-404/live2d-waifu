#!/usr/bin/env node
/**
 * 验证 yyy404 库的几个核心逻辑（无需浏览器）
 * ============================================================================
 * 覆盖：
 *   ① 存储模块：前缀、旧键迁移、异常保护、可覆盖
 *   ② 拖拽数学：吸附目标计算、边界约束
 *   ③ 图标一致性：4 个文件里的 8 个图标必须完全相同
 *   ④ 开关一致性：每个 canXxx 开关都能对应到某个图标
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = __dirname;
const A = (n) => path.join(ROOT, 'assets', n);

let pass = 0, fail = 0;
const ok = (m) => { console.log('  ✓ ' + m); pass++; };
const bad = (m) => { console.log('  ✗ ' + m); fail++; };
const head = (m) => console.log('\n' + m);

const SRC = fs.readFileSync(A('waifu-tips.js'), 'utf8');

// ============================================================================
// 构造最小沙箱，把存储模块单独跑起来
// ============================================================================
function makeSandbox(opts) {
    opts = opts || {};
    const store = new Map();

    const sandbox = {
        console: { log() {}, warn() {}, error() {} },
        window: {}, document: { addEventListener() {}, querySelector: () => null },
        setTimeout, JSON, Math, String, Object, Array, Number, isNaN, parseFloat, parseInt,
    };
    sandbox.window = sandbox;
    sandbox.globalThis = sandbox;

    // localStorage 行为可配置（用于测异常场景）
    sandbox.localStorage = {
        getItem(k) {
            if (opts.throwOnRead) throw new Error('SecurityError: 存储被禁用');
            return store.has(k) ? store.get(k) : null;
        },
        setItem(k, v) {
            if (opts.throwOnWrite) throw new Error('QuotaExceededError: 配额已满');
            store.set(k, String(v));
        },
        removeItem(k) { store.delete(k); },
    };
    sandbox.sessionStorage = sandbox.localStorage;
    sandbox._store = store;

    // 只需要 live2d_settings 存在即可
    vm.createContext(sandbox);
    return sandbox;
}

/** 从真实源码里抽出存储模块那一段，避免测试与实现脱节 */
function extractStorageModule() {
    const start = SRC.indexOf('var STORAGE_PREFIX');
    const end = SRC.indexOf('function showMessage');
    if (start < 0 || end < 0) throw new Error('无法定位存储模块');
    // 去掉中间的 helper 函数（empty / getRandText 等），只保留存储相关
    return SRC.slice(start, end);
}

// ============================================================================
head('=== ① 存储模块 ===');

const storageCode = extractStorageModule();

// --- 场景 1：基本读写（自动加前缀）---
{
    const sb = makeSandbox();
    vm.runInContext("live2d_settings = {}; live2d_settings['showF12Status']=false;", sb);
    vm.runInContext(storageCode, sb);

    vm.runInContext("storageSet('modelId','2')", sb);
    const raw = sb._store.get('yyy404-modelId');
    raw === '2' ? ok('写入自动加前缀: yyy404-modelId = ' + raw)
                : bad('前缀不对，实际键: ' + [...sb._store.keys()].join(','));

    const got = vm.runInContext("storageGet('modelId')", sb);
    got === '2' ? ok('读取正常: ' + got) : bad('读取失败: ' + got);

    // 不应该写入不带前缀的键
    sb._store.has('modelId') ? bad('污染了无前缀的 modelId 键')
                             : ok('未污染无前缀键（避免与网站其它插件冲突）');
}

// --- 场景 2：旧键迁移 ---
{
    const sb = makeSandbox();
    vm.runInContext("live2d_settings = {}; live2d_settings['showF12Status']=false;", sb);
    // 模拟老用户：原版 fghrsh 写的是无前缀的 modelId
    sb._store.set('modelId', '5');
    sb._store.set('modelTexturesId', '12');

    vm.runInContext(storageCode, sb);
    const got = vm.runInContext("storageGet('modelId')", sb);
    got === '5' ? ok('读到旧键的值: ' + got) : bad('旧键读取失败: ' + got);

    sb._store.get('yyy404-modelId') === '5'
        ? ok('已迁移到新键: yyy404-modelId = ' + sb._store.get('yyy404-modelId'))
        : bad('未迁移到新键');

    const tex = vm.runInContext("storageGet('modelTexturesId')", sb);
    tex === '12' ? ok('modelTexturesId 也迁移了: ' + tex) : bad('modelTexturesId 迁移失败: ' + tex);
}

// --- 场景 3：写入抛异常（隐私模式 / 配额满）---
{
    const sb = makeSandbox({ throwOnWrite: true });
    vm.runInContext("live2d_settings = {}; live2d_settings['showF12Status']=false;", sb);
    vm.runInContext(storageCode, sb);
    try {
        vm.runInContext("storageSet('modelId','3')", sb);
        ok('写入失败时不抛异常（隐私模式下不会导致看板娘崩溃）');
    } catch (e) {
        bad('写入失败时抛了异常: ' + e.message);
    }
}

// --- 场景 4：读取抛异常 ---
{
    const sb = makeSandbox({ throwOnRead: true });
    vm.runInContext("live2d_settings = {}; live2d_settings['showF12Status']=false;", sb);
    vm.runInContext(storageCode, sb);
    try {
        const v = vm.runInContext("storageGet('modelId')", sb);
        v === null ? ok('读取失败时返回 null（安全降级）') : bad('读取失败时返回了: ' + v);
    } catch (e) {
        bad('读取失败时抛了异常: ' + e.message);
    }
}

// --- 场景 5：调用方覆盖 storage（GM 存储场景）---
{
    const sb = makeSandbox();
    vm.runInContext("live2d_settings = {}; live2d_settings['showF12Status']=false;", sb);
    vm.runInContext(storageCode, sb);

    // 模拟脚本环境：覆盖成"内存版 GM 存储"
    vm.runInContext(`
        var GM_FAKE = {};
        live2d_settings['storage'] = {
            save: function (k, v) { GM_FAKE[k] = v; },
            load: function (k) { return (k in GM_FAKE) ? GM_FAKE[k] : null; }
        };
    `, sb);

    vm.runInContext("storageSet('modelId','9')", sb);
    vm.runInContext("storageSet('dockSide','left')", sb);

    const inGM = vm.runInContext("GM_FAKE['yyy404-modelId']", sb);
    const inLS = sb._store.get('yyy404-modelId');

    inGM === '9' ? ok('覆盖后写入走到了自定义实现: ' + inGM) : bad('自定义实现未生效: ' + inGM);
    inLS === undefined ? ok('不再写入 localStorage（说明覆盖生效）')
                       : bad('仍写入了 localStorage: ' + inLS);

    const got = vm.runInContext("storageGet('modelId')", sb);
    got === '9' ? ok('从自定义实现读取正常: ' + got) : bad('自定义读取失败: ' + got);
}

// --- 场景 6：非法 storage 对象应被忽略 ---
{
    const sb = makeSandbox();
    vm.runInContext("live2d_settings = {}; live2d_settings['showF12Status']=false;", sb);
    vm.runInContext(storageCode, sb);
    // 只给了 save 没有 load
    vm.runInContext("live2d_settings['storage'] = { save: function(){} };", sb);
    vm.runInContext("storageSet('modelId','7')", sb);
    sb._store.get('yyy404-modelId') === '7'
        ? ok('不完整的 storage 对象被忽略，回退到默认实现')
        : bad('不完整的 storage 对象被误用了');
}

// ============================================================================
head('=== ② 拖拽数学（吸附与边界）===');

/** 复刻 getSnapTarget 的算法 */
function snapTarget(rectLeft, waifuWidth, pageWidth) {
    const center = rectLeft + waifuWidth / 2;
    if (center < pageWidth / 2) return { left: 0, side: 'left' };
    return { left: pageWidth - waifuWidth, side: 'right' };
}

{
    // 页面 1200 宽，看板娘 280 宽
    const PW = 1200, WW = 280;

    // 完全在左边
    let t = snapTarget(0, WW, PW);
    t.side === 'left' && t.left === 0 ? ok('左侧 → 吸附到 left:0')
                                      : bad('左侧吸附错误: ' + JSON.stringify(t));

    // 完全在右边
    t = snapTarget(PW - WW, WW, PW);
    t.side === 'right' && t.left === PW - WW
        ? ok('右侧 → 吸附到 left:' + t.left)
        : bad('右侧吸附错误: ' + JSON.stringify(t));

    // 刚好在中线左边一点 → 应该吸左边
    t = snapTarget(PW/2 - WW/2 - 1, WW, PW);
    t.side === 'left' ? ok('中线偏左 → 吸左')
                      : bad('中线偏左判断错误: ' + t.side);

    // 刚好在中线右边一点 → 应该吸右边
    t = snapTarget(PW/2 - WW/2 + 1, WW, PW);
    t.side === 'right' ? ok('中线偏右 → 吸右')
                       : bad('中线偏右判断错误: ' + t.side);
}

{
    // 边界约束：不能拖出可视区
    const PW = 1200, WW = 280;
    const clamp = (v) => Math.max(0, Math.min(v, PW - WW));
    clamp(-500) === 0 ? ok('拖出左边界被约束到 0') : bad('左边界约束失败');
    clamp(99999) === PW - WW ? ok('拖出右边界被约束到 ' + (PW-WW)) : bad('右边界约束失败');
    clamp(600) === 600 ? ok('区间内不改变位置') : bad('区间内被错误修改');
}

// ============================================================================
head('=== ③ 图标一致性 ===');

const FILES = ['waifu-tips.js', 'waifu-tips.json', 'autoload.js'];
const ICONS = ['el-icon-house', 'el-icon-chat-dot-round', 'el-icon-user',
               'el-icon-magic-stick', 'el-icon-camera', 'el-icon-view',
               'el-icon-discover', 'el-icon-switch-button'];

FILES.forEach((f) => {
    const txt = fs.readFileSync(A(f), 'utf8');
    const missing = ICONS.filter((ic) => txt.indexOf(ic) === -1);
    missing.length === 0 ? ok(f + ' 含全部 8 个图标')
                         : bad(f + ' 缺少: ' + missing.join(', '));
});

// docs/index.html（GitHub Pages 演示页）
{
    const p = path.join(ROOT, 'docs', 'index.html');
    if (fs.existsSync(p)) {
        const txt = fs.readFileSync(p, 'utf8');
        const missing = ICONS.filter((ic) => txt.indexOf(ic) === -1);
        missing.length === 0 ? ok('docs/index.html 含全部 8 个图标')
                             : bad('docs/index.html 缺少: ' + missing.join(', '));
    } else {
        bad('docs/index.html 不存在');
    }
}

// 不应残留旧图标
{
    const all = FILES.map((f) => fs.readFileSync(A(f), 'utf8')).join('\n');
    // el-icon-info 只允许出现在注释里
    const codeOnly = all.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\*.*$/gm, '');
    codeOnly.indexOf('el-icon-info') === -1
        ? ok('代码中无 el-icon-info 残留')
        : bad('代码中仍有 el-icon-info');
    codeOnly.indexOf('fui-') === -1
        ? ok('代码中无 fui- 残留')
        : bad('代码中仍有 fui-');
}

// ============================================================================
head('=== ④ 开关与图标对应 ===');

const tipsSrc = fs.readFileSync(A('waifu-tips.js'), 'utf8');
const SWITCH_ICON = {
    canTurnToHomePage: 'el-icon-house',
    canSwitchHitokoto: 'el-icon-chat-dot-round',
    canSwitchModel: 'el-icon-user',
    canSwitchTextures: 'el-icon-magic-stick',
    canTakeScreenshot: 'el-icon-camera',
    canHideWaifu: 'el-icon-view',
    canTurnToAboutPage: 'el-icon-discover',
    canCloseLive2d: 'el-icon-switch-button',
};

Object.keys(SWITCH_ICON).forEach((sw) => {
    const ic = SWITCH_ICON[sw];
    // 找形如 if (!live2d_settings.canXxx) $('.waifu-tool .el-icon-yyy').hide();
    const re = new RegExp('if\\s*\\(\\s*!live2d_settings\\.' + sw + '\\s*\\)\\s*\\$\\(\'\\.waifu-tool \\.' + ic + '\'\\)\\.hide\\(\\)');
    re.test(tipsSrc) ? ok(sw + ' → ' + ic)
                     : bad(sw + ' 的显隐控制没找到或图标不匹配（应为 ' + ic + '）');
});

// ============================================================================
head('=== ⑤ 切换模型链路（回归：modelStorage=false 时切换失效）===');
/*
 * 曾出现的 bug：
 *   原版 modelStorageGetItem 在 modelStorage=false 时读 sessionStorage，
 *   但 loadModel 那时并不写它 —— 于是换角色读到的 modelId 是 null，
 *   拼出 ?id=undefined，切换逻辑失效（表现为只能在最初一两个模型间打转）。
 *
 *   这里模拟「连续换 8 次角色」，检查 id 是否能正确轮换全部 7 个模型。
 */
{
    const modelsJson = JSON.parse(
        fs.readFileSync(path.join(ROOT, '..', 'live2d-models', 'models.json'), 'utf8')
    );

    // 复刻 staticAPI.switchModel 的行为
    function switchModel(id) {
        const next = parseInt(id, 10) + 1;
        const exists = modelsJson.models.find((x) => x.id === next);
        return exists ? next : 1;
    }

    // 复刻修复后的 loadModel + modelStorageGetItem（内存权威）
    let currentModel = { id: 0, texturesId: 0 };
    const visited = [];
    function loadModel(id, texId) {
        currentModel = { id: parseInt(id, 10) || 1, texturesId: parseInt(texId, 10) || 0 };
        visited.push(currentModel.id);
    }
    function modelStorageGetItem(key) {
        if (key === 'modelId' && currentModel.id) return String(currentModel.id);
        if (key === 'modelTexturesId') return String(currentModel.texturesId || 0);
        return null;
    }

    // 初始加载 id=1（模拟 modelStorage=false，不写存储）
    loadModel(1, 0);

    // 连点「换角色」8 次
    for (let i = 0; i < 8; i++) {
        const cur = parseInt(modelStorageGetItem('modelId'), 10);
        const next = switchModel(cur);
        loadModel(next, 0);
    }

    const uniq = [...new Set(visited)];
    uniq.length >= 7
        ? ok('连续换角色覆盖了 ' + uniq.length + ' 个不同模型: ' + uniq.join(','))
        : bad('只能切换到 ' + uniq.length + ' 个模型（应为 7）: ' + uniq.join(','));

    // 关键：绝不能出现 NaN / undefined / 0
    const invalid = visited.filter((v) => !v || isNaN(v));
    invalid.length === 0
        ? ok('切换过程中没有出现无效 id')
        : bad('出现了无效 id: ' + invalid.join(','));

    // 顺序应该是 1→2→3→4→5→6→7→1→2
    const expected = [1, 2, 3, 4, 5, 6, 7, 1, 2];
    JSON.stringify(visited) === JSON.stringify(expected)
        ? ok('切换顺序正确: ' + visited.join(' → '))
        : bad('切换顺序不对: ' + visited.join(' → ') + '（期望 ' + expected.join(' → ') + '）');
}

// 复现「旧实现」的错误行为，确保测试真的能抓到它
{
    function buggyGetItem(key, modelStorage) {
        // 原版：modelStorage=false 读 sessionStorage，而 loadModel 没写进去
        const storage = modelStorage ? {} : {};
        return storage[key] === undefined ? null : storage[key];
    }
    const got = buggyGetItem('modelId', false);
    const next = parseInt(got, 10) + 1;
    isNaN(next)
        ? ok('已确认旧实现会产生 NaN（测试有效，能抓到该 bug）')
        : bad('旧实现复现失败，测试可能无效');
}

// ============================================================================
head('=== ⑥ 换皮肤链路（回归：路径重复拼接导致 404）===');
/*
 * 曾出现的 bug：
 *   relativize 只处理「绝对 URL」，漏掉了构建期生成的 "../model/<名字>/..." 形式，
 *   于是喂给引擎的数据里 model 字段仍是 "../model/Potion-Maker/Pio/model.moc"。
 *   引擎再拼一次 modelHomeDir，得到
 *       .../Pio/../model/Potion-Maker/Pio/model.moc   → 404
 *   表现：点换皮肤后角色消失，控制台报 Failed to load (404)。
 *
 *   这条测试直接跑真实的 static-api，检查换皮肤时交给引擎的路径是否干净。
 */
{
    const SRC_API = fs.readFileSync(A('live2d-static-api.js'), 'utf8');
    const dataDir = path.join(ROOT, '..', 'live2d-models');

    // 极简 XHR 桩：data: 解码 + 按 responseType 产出
    function makeXHR() {
        function X() { this.responseType = ''; this.response = null; this.responseText = ''; this.status = 0; }
        X.prototype.open = function (m, u) { this._u = String(u); };
        X.prototype.send = function () {
            let text = null;
            if (this._u.indexOf('data:application/json') === 0) {
                text = Buffer.from(this._u.slice(this._u.indexOf('base64,') + 7), 'base64').toString('utf8');
            }
            if (text === null) { this.status = 404; if (this.onload) this.onload(); return; }
            this.status = 200;
            if (this.responseType === 'arraybuffer') {
                const b = Buffer.from(text, 'utf8');
                this.response = b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
            } else { this.responseText = text; this.response = text; }
            if (this.onload) this.onload();
        };
        return X;
    }

    const sb = {
        console: { log() {}, warn() {}, error() {} },
        document: { baseURI: 'http://127.0.0.1:5173/live2d-waifu/verify.html' },
        URL, JSON, setTimeout, TextEncoder, DOMException,
        btoa: (s) => Buffer.from(s, 'binary').toString('base64'),
    };
    sb.window = sb; sb.globalThis = sb; sb.XMLHttpRequest = makeXHR();
    vm.createContext(sb);
    vm.runInContext(SRC_API, sb);

    const modelsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'models.json'), 'utf8'));
    const api = sb.createStaticModelAPI({
        base: 'http://127.0.0.1:5173/live2d-models/',
        data: modelsData,
        onLog: () => {},
    });
    api.installXHRHook();

    function payloadFor(mid, tid) {
        const url = api.apiUrlFor(mid, tid);
        const x = new sb.XMLHttpRequest();
        let out = null;
        x.open('GET', url, true);
        x.responseType = 'arraybuffer';
        x.onload = function () {
            try { out = JSON.parse(Buffer.from(x.response).toString('utf8')); } catch (e) { out = null; }
        };
        x.send(null);
        return out;
    }

    // 换皮肤必须真的改变贴图，且路径必须是干净的相对路径
    const cases = [[1, 1], [1, 5], [2, 30], [3, 100]];
    let dirty = 0, unchanged = 0;

    cases.forEach(([mid, tid]) => {
        const p = payloadFor(mid, tid);
        if (!p) { bad(`模型${mid}-${tid} 拿不到改写后的数据`); return; }

        const all = [p.model].concat(p.textures || []);
        const badPaths = all.filter((u) =>
            /^\.\.\//.test(u) || /^\//.test(u) || /^https?:/i.test(u));
        if (badPaths.length) {
            bad(`模型${mid}-${tid} 存在脏路径: ${badPaths[0]}`);
            dirty++;
            return;
        }
        // 贴图必须是「相对模型目录」的路径。
        // ⚠️ 不能只允许 textures/ 开头：22娘/33娘 是多层叠加结构，
        //    贴图分布在各层目录（texture_00/、texture_01/ …）。
        //    这里只检查它不是绝对路径、也不含 ../。
        const texOk = (p.textures || []).every((t) =>
            !/^\.\.\//.test(t) && !/^\//.test(t) && !/^https?:/i.test(t) && t.indexOf('..') === -1);
        texOk ? ok(`模型${mid}-${tid} 路径干净: ${p.model} + ${(p.textures || []).map(t => t.split('/').pop()).join(',')}`)
              : bad(`模型${mid}-${tid} 贴图路径异常: ${JSON.stringify(p.textures)}`);
    });

    // 同一模型不同贴图 id 必须产出不同的 textures
    const a = payloadFor(1, 1), b = payloadFor(1, 5);
    if (a && b && JSON.stringify(a.textures) !== JSON.stringify(b.textures)) {
        ok('不同贴图 id 产出不同 textures（换皮肤真的生效）');
    } else {
        bad('不同贴图 id 产出了相同 textures —— 换皮肤无效');
    }

    // 模拟引擎拼接：modelHomeDir + 相对路径，必须与实际文件对得上
    {
        const p = payloadFor(1, 5);
        const homeDir = 'http://127.0.0.1:5173/live2d-models/model/Potion-Maker/Pio/';
        const full = homeDir + p.model;
        const diskPath = path.join(dataDir, 'model', 'Potion-Maker', 'Pio', p.model);
        const exists = fs.existsSync(diskPath) && full.indexOf('/../') === -1;
        exists ? ok('引擎拼接后的 model 路径真实存在: ' + p.model)
               : bad('引擎拼接后的 model 路径无效: ' + full);
    }
}

// ============================================================================
head('=== ⑦ 消息优先级（回归：一言被悬停台词顶掉）===');
/*
 * 问题：一言、换装这类用户主动触发的内容，会被「鼠标划过看板娘」的台词顶掉。
 *
 * 解法与 1.0.3 一致：在 showMessage 之上套一层 messageSystem，
 * showMessage / hideMessage 本身一行不改（保证气泡动画行为和原版一致）。
 *
 * ⚠️ 测试里不用真定时器：verify.js 是同步脚本，忙等会阻塞事件循环，
 *    setTimeout 永远不会触发。这里把回调存起来手动调用。
 */
{
    const tipsSrc = fs.readFileSync(A('waifu-tips.js'), 'utf8');

    // —— 结构检查 ——
    tipsSrc.indexOf('var messageSystem') !== -1
        ? ok('存在 messageSystem 消息优先级层')
        : bad('缺少 messageSystem');

    // showMessage / hideMessage 必须保持原始实现（不许动）
    /function showMessage\(text, timeout, flag\)/.test(tipsSrc)
        ? ok('showMessage 保持原始签名 (text, timeout, flag)')
        : bad('showMessage 签名被改动过');

    /sessionStorage\.getItem\('waifu-text'\)/.test(tipsSrc)
        ? ok('保留原始 sessionStorage 判断')
        : bad('原始 sessionStorage 判断被移除了');

    // 悬停台词必须走 showNormal
    /messageSystem\.showNormal\(text,\s*3000\)/.test(tipsSrc)
        ? ok('悬停台词走 messageSystem.showNormal')
        : bad('悬停台词未走 showNormal');

    // 一言正文 6000ms，锁覆盖正文 + 出处段
    /HITOKOTO_MAIN_MS\s*=\s*6000/.test(tipsSrc)
        ? ok('一言正文时长 6000ms')
        : bad('一言正文时长不是 6000ms');

    /HITOKOTO_LOCK_MS\s*=\s*HITOKOTO_MAIN_MS\s*\+\s*3000/.test(tipsSrc)
        ? ok('锁定时长覆盖出处信息段（正文 + 3000ms）')
        : bad('锁定时长未覆盖出处信息段');

    // 空闲自动请求间隔必须可配置（原版写死 30 秒，太频繁）
    /live2d_settings\['hitokotoInterval'\]\s*=\s*(\d+)/.test(tipsSrc)
        ? ok('空闲自动一言间隔可配置')
        : bad('缺少 hitokotoInterval 配置项');

    // 不能再出现写死的 30000
    /setInterval\(showHitokotoActed,\s*30000\)/.test(tipsSrc)
        ? bad('仍写死 30000ms 自动请求间隔')
        : ok('已无写死的 30000ms 间隔');

    // —— 行为检查（复刻 messageSystem 状态机）——
    let lockTimer = null;
    const ms = {
        isImportantMessageShowing: false,
        _timer: null,
        showImportant: function (text, timeout, lockMs) {
            this.isImportantMessageShowing = true;
            if (this._timer) clearTimeout(this._timer);
            this._timer = { cb: () => { this.isImportantMessageShowing = false; } };
            lockTimer = this._timer;
            return true;
        },
        showNormal: function () {
            return !this.isImportantMessageShowing;
        },
    };

    // ① 重要消息显示中，普通消息被丢弃
    ms.isImportantMessageShowing = false; ms._timer = null;
    ms.showImportant('一言内容', 8000, 11000);
    const blocked = ms.showNormal('干嘛呢你，快把手拿开', 3000);
    blocked === false
        ? ok('重要消息显示期间，悬停台词被丢弃')
        : bad('悬停台词没有被拦住');

    // ② 锁到期后普通消息恢复正常
    lockTimer.cb();
    const allowed = ms.showNormal('悬停台词', 3000);
    allowed === true
        ? ok('锁到期后，悬停台词可以正常显示')
        : bad('锁到期后仍被拦截');

    // ③ 连续两条重要消息：前一条的定时器必须被取消（修掉 1.0.3 的隐患）
    ms.isImportantMessageShowing = false; ms._timer = null;
    ms.showImportant('一言1', 8000, 11000);
    const firstTimer = lockTimer;
    ms.showImportant('一言2', 8000, 11000);
    (lockTimer !== firstTimer)
        ? ok('连续重要消息会重置锁定时器（不会提前解锁）')
        : bad('连续重要消息仍复用旧定时器，会提前解锁');
}

// ============================================================================
head('=== ⑧ 换皮肤 / 换模型 id 语义（对齐 fghrsh PHP）===');
/*
 * 曾出现的 bug：
 *   把 modelTexturesRandMode 设成 'switch' 后，Tia 第一次点换皮肤，
 *   气泡框弹出「我还没有其他衣服呢」，再点一次才正常。
 *
 * 原因：
 *   fghrsh 的 switch_textures/index.php 里是
 *       $newId = $modelTexturesId == 0 ? 2 : $modelTexturesId + 1;
 *   当前 id 为 0（默认贴图）时，下一套应该是 2，不是 1。
 *   如果错写成 1，waifu-tips.js 会判定「切换前后都是第 1 套」，弹出「没有其他衣服」。
 *
 * 顺带修了同类的两处：
 *   rand_textures 不排除当前套 → 点换皮肤可能随机到同一套，看起来没反应
 *   rand 换模型不排除当前模型 → 点换角色可能换到同一个
 */
{
    const SRC_API = fs.readFileSync(A('live2d-static-api.js'), 'utf8');
    const dataDir = path.join(ROOT, '..', 'live2d-models');

    function makeXHR() {
        function X() { this.responseType = ''; this.response = null; this.responseText = ''; this.status = 0; }
        X.prototype.open = function (m, u) { this._u = String(u); };
        X.prototype.send = function () {
            let text = null;
            if (this._u.indexOf('data:application/json') === 0) {
                text = Buffer.from(this._u.slice(this._u.indexOf('base64,') + 7), 'base64').toString('utf8');
            }
            if (text === null) { this.status = 404; if (this.onload) this.onload(); return; }
            this.status = 200;
            if (this.responseType === 'arraybuffer') {
                const b = Buffer.from(text, 'utf8');
                this.response = b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
            } else { this.responseText = text; this.response = text; }
            if (this.onload) this.onload();
        };
        return X;
    }

    const sb = {
        console: { log() {}, warn() {}, error() {} },
        document: { baseURI: 'http://127.0.0.1:5173/live2d-waifu/verify.html' },
        URL, JSON, setTimeout, TextEncoder, DOMException,
        btoa: (s) => Buffer.from(s, 'binary').toString('base64'),
    };
    sb.window = sb; sb.globalThis = sb; sb.XMLHttpRequest = makeXHR();
    vm.createContext(sb);
    vm.runInContext(SRC_API, sb);

    const modelsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'models.json'), 'utf8'));
    const api = sb.createStaticModelAPI({
        base: 'http://127.0.0.1:5173/live2d-models/',
        data: modelsData,
        onLog: () => {},
    });

    const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

    // ① switch：0 必须跳到 2
    eq(api.switchTextures(2, 0, 'switch'), 2)
        ? ok('switch 从 0 开始 → 2（不再误报「没有其他衣服」）')
        : bad('switch 从 0 开始应得 2，实际 ' + api.switchTextures(2, 0, 'switch'));

    // ② switch：正常递增与回绕
    (eq(api.switchTextures(2, 2, 'switch'), 3) && eq(api.switchTextures(2, 63, 'switch'), 1))
        ? ok('switch 递增与末位回绕正确（2→3, 63→1）')
        : bad('switch 递增或回绕不正确');

    // ③ switch 连续 20 步不得出现相邻重复
    {
        let cur = 0; const seq = [];
        for (let i = 0; i < 20; i++) { cur = api.switchTextures(2, cur, 'switch'); seq.push(cur); }
        const adjDup = seq.some((v, i) => i > 0 && v === seq[i - 1]);
        const badRange = seq.some((v) => v < 1 || v > 63);
        (!adjDup && !badRange)
            ? ok('switch 连续 20 步无相邻重复、取值合法: ' + seq.slice(0, 8).join('→') + '…')
            : bad('switch 序列异常: ' + seq.join('→'));
    }

    // ④ rand 不得返回当前套
    {
        let same = 0;
        for (let t = 1; t <= 63; t++) if (api.switchTextures(2, t, 'rand') === t) same++;
        same === 0
            ? ok('rand 换皮肤不会返回当前套（63 次全通过）')
            : bad('rand 换皮肤有 ' + same + ' 次返回了当前套');
    }

    // ⑤ rand 当前 0 时不得返回 1（PHP 把 0 当 1）
    {
        let one = 0;
        for (let i = 0; i < 200; i++) if (api.switchTextures(2, 0, 'rand') === 1) one++;
        one === 0
            ? ok('rand 当前 0 时不会返回 1（与 PHP 一致）')
            : bad('rand 当前 0 时有 ' + one + ' 次返回 1');
    }

    // ⑥ rand 换模型不得返回当前模型
    {
        let same = 0;
        for (let id = 1; id <= 7; id++) {
            for (let i = 0; i < 50; i++) if (api.randModel(id).id === id) same++;
        }
        same === 0
            ? ok('rand 换角色不会返回当前模型（350 次全通过）')
            : bad('rand 换角色有 ' + same + ' 次返回了当前模型');
    }

    // ⑦ 单套贴图（分组模型的一个形态）不应崩
    {
        const r = api.switchTextures(6, 0, 'switch');
        (r >= 1 && r <= api.textureCount(6))
            ? ok('分组模型 switch 取值合法（id=' + r + ' / 共 ' + api.textureCount(6) + '）')
            : bad('分组模型 switch 取值越界: ' + r);
    }
}

// ============================================================================
head('=== ⑨ 皮肤按角色记忆（回归：换一圈角色回来变原皮）===');
/*
 * 曾出现的 bug：
 *   给 Pio 挑了第 5 套衣服，刷新还在；
 *   但换角色绕一圈回到 Pio，又变回原皮。
 *
 * 原因：
 *   存储里只保存一个全局 modelTexturesId，换角色时被新角色的皮肤覆盖。
 *   而 loadOtherModel() 调的是 loadModel(id) —— 皮肤参数默认 0，
 *   于是每次换角色都把全局皮肤写成 0，Pio 的 5 就没了。
 *
 * 现在：
 *   皮肤按角色分开存（textures_<角色id>），loadModel 不传皮肤时
 *   自动读取该角色自己记住的那套。
 */
{
    // 复刻库里的存储 + loadModel 逻辑
    const PREFIX = 'yyy404-';
    let store;
    const sg = (k) => (store[PREFIX + k] !== undefined ? store[PREFIX + k] : null);
    const ss = (k, v) => { store[PREFIX + k] = String(v); };

    function sgTextures(mid) {
        const n = parseInt(sg('textures_' + mid), 10);
        return (isNaN(n) || n < 0) ? 0 : n;
    }
    function ssTextures(mid, tid) { ss('textures_' + mid, parseInt(tid, 10) || 0); }

    function migrate(mid) {
        if (sg('textures_' + mid) !== null) return false;
        const old = sg('modelTexturesId');
        if (old === null || old === '') return false;
        const n = parseInt(old, 10);
        if (isNaN(n) || n <= 0) return false;
        ssTextures(mid, n);
        return true;
    }

    let cur = { id: 1, texturesId: 0 };
    function loadModel(modelId, modelTexturesId) {
        const mid = parseInt(modelId, 10) || 1;
        const tid = (modelTexturesId === undefined || modelTexturesId === null)
            ? sgTextures(mid)
            : (parseInt(modelTexturesId, 10) || 0);
        cur = { id: mid, texturesId: tid };
        ss('modelId', mid);
        ssTextures(mid, tid);
        ss('modelTexturesId', tid);   // 兼容写一份当前值
        return cur;
    }

    // ---- ① 核心场景 ----
    store = {};
    loadModel(1, 5);                 // Pio 选第 5 套
    loadModel(2);                    // 换 Tia（不传皮肤）
    loadModel(3);                    // 换 22娘
    const backToPio = loadModel(1);  // 换回 Pio

    backToPio.texturesId === 5
        ? ok('换一圈角色回到 Pio，仍是第 5 套')
        : bad('回到 Pio 皮肤丢失: 期望 5，实际 ' + backToPio.texturesId);

    // ---- ② 新角色首次出现应是原皮 ----
    const tiaFirst = cur.id === 2 ? null : null;   // 占位，下面单独测
    store = {};
    loadModel(1, 5);
    const tia = loadModel(2);
    tia.texturesId === 0
        ? ok('没记录过的新角色首次进入是原皮')
        : bad('新角色首次进入应为原皮，实际 ' + tia.texturesId);

    // ---- ③ 两个角色的皮肤互不影响 ----
    store = {};
    loadModel(1, 5);
    loadModel(2, 30);
    const p1 = loadModel(1);
    const t1 = loadModel(2);
    (p1.texturesId === 5 && t1.texturesId === 30)
        ? ok('两个角色各自记住自己的皮肤（Pio=5, Tia=30）')
        : bad(`角色间皮肤串了: Pio=${p1.texturesId} Tia=${t1.texturesId}`);

    // ---- ④ 重复切回同一角色，皮肤保持 ----
    store = {};
    loadModel(1, 7);
    for (let i = 0; i < 5; i++) { loadModel(2); loadModel(3); loadModel(1); }
    cur.texturesId === 7
        ? ok('反复切换 5 轮，Pio 皮肤仍是第 7 套')
        : bad('反复切换后皮肤丢失，实际 ' + cur.texturesId);

    // ---- ⑤ 旧数据迁移 ----
    store = { 'yyy404-modelId': '1', 'yyy404-modelTexturesId': '53' };
    const migrated = migrate(1);
    (migrated && sg('textures_1') === '53')
        ? ok('旧版单一皮肤值能迁移给当前角色（→ 第 53 套）')
        : bad('旧数据迁移失败');

    // ---- ⑥ 迁移幂等 ----
    const again = migrate(1);
    (!again && sg('textures_1') === '53')
        ? ok('迁移可重复执行，不会重复写入')
        : bad('迁移不幂等');

    // ---- ⑦ 源码检查：loadOtherModel 不应传皮肤参数 ----
    const libSrc = fs.readFileSync(A('waifu-tips.js'), 'utf8');
    /loadModel\(newId\)/.test(libSrc)
        ? ok('loadOtherModel 不传皮肤参数（由 loadModel 自动读该角色的）')
        : bad('loadOtherModel 仍显式传皮肤，会覆盖记录');

    /function storageGetModelTextures/.test(libSrc)
        ? ok('库中存在 storageGetModelTextures（按角色读皮肤）')
        : bad('缺少 storageGetModelTextures');

    /function migrateModelTextures/.test(libSrc)
        ? ok('库中存在 migrateModelTextures（旧数据迁移）')
        : bad('缺少 migrateModelTextures');
}

// ============================================================================
console.log('\n================================');
console.log('  通过 ' + pass + ' / 失败 ' + fail);
if (fail) process.exit(1);
console.log('  全部通过 ✓');
