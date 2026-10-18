window.live2d_settings = Array(); /*

    く__,.ヘヽ.　　　　/　,ー､ 〉
    　　　　　＼ ', !-─‐-i　/　/´
    　　　 　 ／｀ｰ'　　　 L/／｀ヽ､            Live2D 看板娘 参数设置
    　　 　 /　 ／,　 /|　 ,　 ,　　　 ',                    静态化版
    　　　ｲ 　/ /-‐/　ｉ　L_ ﾊ ヽ!　 i                      v2.0.0
    　　　 ﾚ ﾍ 7ｲ｀ﾄ　 ﾚ'ｧ-ﾄ､!ハ|　 |
    　　　　 !,/7 '0'　　 ´0iソ| 　 |             yyy404
    　　　　 |.从"　　_　　 ,,,, / |./ 　 |             https://github.com/whyyy-404
    　　　　 ﾚ'| i＞.､,,__　_,.イ / 　.i 　|
    　　　　　 ﾚ'| | / k_７_/ﾚ'ヽ,　ﾊ.　|      Thanks
    　　　　　　 | |/i 〈|/　 i　,.ﾍ |　i　|        fghrsh / live2d_demo · live2d_api
    　　　　　　.|/ /　ｉ： 　 ﾍ!　　＼　|        stevenjoezhang / live2d-widget
    　　　 　 　 kヽ>､ﾊ 　 _,.ﾍ､ 　 /､!          journey-ad / xiazeyu / guansss
    　　　　　　 !'〈//｀Ｔ´', ＼ ｀'7'ｰr'          jsDelivr · Element UI
    　　　　　　 ﾚ'ヽL__|___i,___,ンﾚ|ノ          Live2d Cubism SDK & All model authors.
    　　　　　 　　　ﾄ-,/　|___./
    　　　　　 　　　'ｰ'　　!_,.:*********************************************************************************/

/* ============================================================================
 * 工具栏按钮与图标的对应关系（8 个）
 * ----------------------------------------------------------------------------
 *   顺序   图标类名                     功能             开关项
 *   ────────────────────────────────────────────────────────────────────────
 *    1     .el-icon-house               首页             canTurnToHomePage
 *    2     .el-icon-chat-dot-round      一言             canSwitchHitokoto
 *    3     .el-icon-user                换角色           canSwitchModel
 *    4     .el-icon-magic-stick         换皮肤           canSwitchTextures
 *    5     .el-icon-camera              拍照             canTakeScreenshot
 *    6     .el-icon-view                隐藏             canHideWaifu
 *    7     .el-icon-discover            关于             canTurnToAboutPage
 *    8     .el-icon-switch-button       关闭             canCloseLive2d
 *
 * ⚠️ 使用前必须引入 element-ui 的图标样式，二选一：
 *      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/element-ui/lib/theme-chalk/icon.css">
 *      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/element-ui/lib/theme-chalk/index.css">
 * ========================================================================== */


// 后端接口
live2d_settings['modelAPI']             = '//live2d.fghrsh.net/api/';   // 自建 API 修改这里
live2d_settings['tipsMessage']          = 'waifu-tips.json';            // 同目录下可省略路径
live2d_settings['hitokotoAPI']          = 'hitokoto.cn';                // 一言 API，可选 'hitokoto.cn'(推荐，支持跨域), 'lwl12.com', 'jinrishici.com'(古诗词)

// 默认模型
live2d_settings['modelId']              = 1;            // 默认模型 ID，可在 F12 控制台找到
live2d_settings['modelTexturesId']      = 53;           // 默认材质 ID，可在 F12 控制台找到

// 工具栏设置
live2d_settings['showToolMenu']         = true;         // 显示 工具栏          ，可选 true(真), false(假)
live2d_settings['canCloseLive2d']       = true;         // 显示 关闭看板娘  按钮，可选 true(真), false(假)
live2d_settings['canSwitchModel']       = true;         // 显示 模型切换    按钮，可选 true(真), false(假)
live2d_settings['canSwitchTextures']    = true;         // 显示 材质切换    按钮，可选 true(真), false(假)
live2d_settings['canSwitchHitokoto']    = true;         // 显示 一言切换    按钮，可选 true(真), false(假)
live2d_settings['canTakeScreenshot']    = true;         // 显示 看板娘截图  按钮，可选 true(真), false(假)
live2d_settings['canTurnToHomePage']    = true;         // 显示 返回首页    按钮，可选 true(真), false(假)
live2d_settings['canTurnToAboutPage']   = true;         // 显示 跳转关于页  按钮，可选 true(真), false(假)

// 模型切换模式
live2d_settings['modelStorage']         = true;         // 记录 ID (刷新后恢复)，可选 true(真), false(假)
live2d_settings['modelRandMode']        = 'switch';     // 模型切换，可选 'rand'(随机), 'switch'(顺序)
live2d_settings['modelTexturesRandMode']= 'switch';       // 材质切换，可选 'rand'(随机), 'switch'(顺序)

// 提示消息选项
live2d_settings['showHitokoto']         = true;         // 显示一言
// 空闲时多久自动换一条一言（毫秒）。0 = 不自动，只能手动点工具栏的「一言」按钮。
// ⚠️ 原版是 30 秒，对普通网站来说太打扰（用户正在专心看内容，突然冒出一句）。
//    默认关闭。想开启就填一个数字，比如 300000 = 每 5 分钟一条。
live2d_settings['hitokotoInterval']     = 0;
live2d_settings['showF12Status']        = true;         // 显示加载状态
live2d_settings['showF12Message']       = false;        // 显示看板娘消息
live2d_settings['showF12OpenMsg']       = true;         // 显示控制台打开提示
live2d_settings['showCopyMessage']      = true;         // 显示 复制内容 提示
live2d_settings['showWelcomeMessage']   = true;         // 显示进入面页欢迎词

// 看板娘样式设置
live2d_settings['waifuSize']            = '280x250';    // 看板娘大小，例如 '280x250', '600x535'
live2d_settings['waifuTipsSize']        = '250x70';     // 提示框大小，例如 '250x70', '570x150'
live2d_settings['waifuFontSize']        = '14px';       // 提示框字体，例如 '12px', '30px'
live2d_settings['waifuToolFont']        = '14px';       // 工具栏字体，例如 '14px', '36px'
live2d_settings['waifuToolLine']        = '20px';       // 工具栏行高，例如 '20px', '36px'
live2d_settings['waifuTipsTop']         = '0px';        // 气泡框顶部偏移（作用于 .waifu-tips）
live2d_settings['waifuToolTop']         = '30px';       // 工具栏顶部边距（作用于 .waifu-tool）
live2d_settings['waifuMinWidth']        = '768px';      // 面页小于 指定宽度 隐藏看板娘，例如 'disable'(禁用), '768px'
live2d_settings['waifuEdgeSide']        = 'right:0';    // 看板娘贴边方向，例如 'left:0'(靠左 0px), 'right:30'(靠右 30px)

// 拖拽设置
//   拖动过程：两个方向都跟手，但不能拖出可视区
//   松开之后：吸附到最近的左 / 右边缘，垂直回到贴底位置（带缓动）
//   窗口缩放：按记录的停靠边实时重算，始终贴边（不会跑到屏幕外）
//
//   'axis-x'     启用（默认）
//   'disable'    禁用（'none' 同义）
//
// ⚠️ 本版不依赖 jQuery UI，用原生 Pointer Events 实现：
//    支持触摸屏，且不会出现鼠标移出窗口后拖拽卡死的问题。
live2d_settings['waifuDraggable']       = 'axis-x';     // 'axis-x' | 'disable'
live2d_settings['waifuDraggableRevert'] = true;         // 松手是否吸附到边缘
live2d_settings['waifuDraggableSave']   = true;         // 是否记住停靠在哪一边
live2d_settings['waifuDraggableSnap']   = 300;          // 吸附动画【最大】时长（毫秒）
                                                        // 实际时长按移动距离缩放：<40px 用 120ms，>=400px 用这个值

// 隐藏模式（点工具栏的眼睛图标）
//   行为：鼠标悬停在模型上时模型隐藏，移开恢复；工具栏全程可见可点。
//   不写入存储 —— 刷新后自动回到普通状态，避免用户把自己"锁"在隐藏模式里。
live2d_settings['canHideWaifu']         = true;         // 显示 悬停隐藏 按钮

// 存储设置
//   ⚠️ 这是「库」的记忆功能，默认使用 localStorage（按网站分别记忆）。
//      如果你在用户脚本里使用本库，可以覆盖成 GM 存储来实现「跨网站同步」：
//
//          live2d_settings['storage'] = {
//              save: function (key, value) { GM_setValue(key, value); },
//              load: function (key) { return GM_getValue(key, null); }
//          };
//
//      也可以覆盖成「什么都不记」（公共电脑场景）：
//
//          live2d_settings['storage'] = { save: function () {}, load: function () { return null; } };
//
//       接口约定：
//          save(key, value)   value 一律为字符串
//          load(key)          返回字符串；没有则返回 null
live2d_settings['storage']              = null;         // null = 使用内置的 localStorage 实现

// 其他杂项设置
live2d_settings['l2dVersion']           = '2.0.0';        // 当前版本
live2d_settings['l2dVerDate']           = '2026.10.18';   // 版本更新日期
live2d_settings['homePageUrl']          = 'auto';       // 主页地址，可选 'auto'(自动), '{URL 网址}'
live2d_settings['aboutPageUrl']         = 'https://github.com/whyyy-404';   // 关于页地址, '{URL 网址}'
live2d_settings['screenshotCaptureName']= 'live2d.png'; // 看板娘截图文件名，例如 'live2d.png'

/****************************************************************************************************/

String.prototype.render = function(context) {
    var tokenReg = /(\\)?\{([^\{\}\\]+)(\\)?\}/g;

    return this.replace(tokenReg, function (word, slash1, token, slash2) {
        if (slash1 || slash2) { return word.replace('\\', ''); }
        
        var variables = token.replace(/\s/g, '').split('.');
        var currentObject = context;
        var i, length, variable;
        
        for (i = 0, length = variables.length; i < length; ++i) {
            variable = variables[i];
            currentObject = currentObject[variable];
            if (currentObject === undefined || currentObject === null) return '';
        }
        return currentObject;
    });
};

var re = /x/;
console.log(re);

function empty(obj) {return typeof obj=="undefined"||obj==null||obj==""?true:false}
function getRandText(text) {return Array.isArray(text) ? text[Math.floor(Math.random() * text.length + 1)-1] : text}

/**
 * 当前正在显示的模型 / 贴图。
 * 换角色、换皮肤都要从「当前值」推「下一个」，所以必须有个权威来源。
 * 不能只依赖存储 —— modelStorage=false 时不写存储，而且存储可能被禁用。
 */
var currentModel = { id: 0, texturesId: 0 };

/* ============================================================================
 * 存储模块
 * ----------------------------------------------------------------------------
 * 用途：记住看板娘的选择（当前模型、材质、停靠位置）。
 *
 * 设计：默认用 localStorage，但允许调用方通过 live2d_settings['storage']
 *       覆盖成任意实现（GM 存储 / 服务端 / 不存储）。
 *
 * 与原版（fghrsh）的区别：
 *   1. 键名加前缀，避免和网站上其它插件用的通用名（如裸 'modelId'）互相覆盖
 *   2. 自动迁移旧键：老用户从原版升级过来，之前的模型选择不会丢
 *   3. 全程 try/catch —— 隐私模式、存储被禁、配额用满时只降级不报错
 *      （原版在这些情况下会直接抛异常，导致看板娘白屏）
 * ========================================================================== */

var STORAGE_PREFIX = 'yyy404-';

/** 内置的 localStorage 实现（带异常保护） */
var defaultStorage = {
    save: function (key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            // Safari 隐私模式 / 存储被禁用 / 配额满 —— 静默降级，不影响看板娘运行
            if (live2d_settings.showF12Status) {
                console.warn('[Storage] 写入失败（可能是隐私模式或存储已满）:', e.message);
            }
        }
    },
    load: function (key) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            return null;
        }
    }
};

/** 取当前生效的存储实现（调用方覆盖优先） */
function getStorage() {
    var s = live2d_settings['storage'];
    // 只接受同时具备 save / load 的对象
    if (s && typeof s.save === 'function' && typeof s.load === 'function') return s;
    return defaultStorage;
}

/** 读（自动带前缀；同时兼容旧键） */
function storageGet(key) {
    var v = getStorage().load(STORAGE_PREFIX + key);
    if (v !== null && v !== undefined) return v;

    // 旧键迁移：原版用的是不带前缀的 'modelId' / 'modelTexturesId'
    var legacyKey = null;
    if (key === 'modelId') legacyKey = 'modelId';
    else if (key === 'modelTexturesId') legacyKey = 'modelTexturesId';
    else if (key === 'dockSide') legacyKey = null;   // 原版没有这个

    if (legacyKey) {
        var old = defaultStorage.load(legacyKey);
        if (old !== null && old !== undefined) {
            // 迁移到新键，之后就走新键了
            storageSet(key, old);
            if (live2d_settings.showF12Status) {
                console.log('[Storage] 已迁移旧键:', legacyKey, '→', STORAGE_PREFIX + key);
            }
            return old;
        }
    }
    return null;
}

/** 写（自动带前缀） */
function storageSet(key, value) {
    getStorage().save(STORAGE_PREFIX + key, String(value));
}

function showMessage(text, timeout, flag) {
    if(flag || sessionStorage.getItem('waifu-text') === '' || sessionStorage.getItem('waifu-text') === null){
        if(Array.isArray(text)) text = text[Math.floor(Math.random() * text.length + 1)-1];
        if (live2d_settings.showF12Message) console.log('[Message]', text.replace(/<[^<>]+>/g,''));
        
        if(flag) sessionStorage.setItem('waifu-text', text);
        
        $('.waifu-tips').stop();
        $('.waifu-tips').html(text).fadeTo(200, 1);
        if (timeout === undefined) timeout = 5000;
        hideMessage(timeout);
    }
}

function hideMessage(timeout) {
    $('.waifu-tips').stop().css('opacity',1);
    if (timeout === undefined) timeout = 5000;
    window.setTimeout(function() {sessionStorage.removeItem('waifu-text')}, timeout);
    $('.waifu-tips').delay(timeout).fadeTo(200, 0);
}

/* ============================================================================
 * 消息优先级（与 1.0.3 脚本一致）
 * ----------------------------------------------------------------------------
 * 问题：一言、天气这类用户主动触发的长内容，会被「鼠标划过看板娘」的台词顶掉。
 *
 * 做法和 1.0.3 一样，在 showMessage 之上再套一层：
 *
 *   重要消息（一言、换装反馈等）→ 上锁，锁持续 timeout 毫秒
 *   普通消息（悬停台词等）      → 上锁期间直接丢弃，连 showMessage 都不调用
 *
 * ⚠️ showMessage / hideMessage 完全保持原样，一行都没改。
 *    这样气泡的淡入淡出行为和原版一模一样，不会因为改动产生「不自然」的感觉。
 *
 * ⚠️ 相比 1.0.3 修了一个隐患：连续发两条重要消息时，
 *    1.0.3 的前一个 setTimeout 会提前解除锁定。这里先 clearTimeout 再重排。
 * ========================================================================== */
var messageSystem = {
    isImportantMessageShowing: false,
    _timer: null,

    /**
     * 显示重要消息。
     * @param {string|string[]} text  内容
     * @param {number} timeout        显示时长（毫秒）
     * @param {number} [lockMs]       锁定时长，默认等于 timeout。
     *                                用于「内容分成几段、需要整体锁住」的场景。
     */
    showImportant: function (text, timeout, lockMs) {
        this.isImportantMessageShowing = true;
        showMessage(text, timeout, true);

        var ms = lockMs || timeout || 5000;
        if (this._timer) clearTimeout(this._timer);
        var self = this;
        this._timer = window.setTimeout(function () {
            self.isImportantMessageShowing = false;
            self._timer = null;
        }, ms);
    },

    /** 显示普通消息：重要消息显示期间直接丢弃 */
    showNormal: function (text, timeout) {
        if (this.isImportantMessageShowing) {
            if (live2d_settings.showF12Message) {
                console.log('[Message] 重要消息显示中，忽略普通消息');
            }
            return;
        }
        showMessage(text, timeout);
    }
};

/* ============================================================================
 * 拖拽模块
 * ----------------------------------------------------------------------------
 * 替代原版的 jQuery UI draggable，改为原生 Pointer Events 实现。
 *
 * 相比原版的改进：
 *   1. 不再依赖 jQuery UI（省掉一个 100KB+ 的库）
 *   2. 支持触摸屏（原版 jQuery UI draggable 在手机上基本不能用）
 *   3. 用 setPointerCapture，鼠标拖出窗口再回来也不会「卡死」
 *      —— 原版需要额外监听 mouseleave 来兜底，这里天然没这个问题
 *   4. 松手吸附到最近的边缘，带缓动动画（原版的 revert 是弹回原位，不是吸附）
 *   5. 停靠位置会被记住，刷新后恢复
 *
 * 模式（live2d_settings.waifuDraggable）：
 *   'axis-x'     水平拖拽 + 松手吸附到最近边缘（默认）
 *   'unlimited'  自由拖拽，停在哪就是哪
 *   'disable'    禁用（或 'none'）
 * ========================================================================== */

/** 缓动函数：easeOutCubic */
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

/** 设置看板娘水平位置（统一用 left 定位，避免 left/right 混用出问题） */
/**
 * 设置看板娘的水平位置。
 * ⚠️ 统一用 left 定位（同时清掉 right / top，只保留 bottom 贴底），
 *    避免 left 与 right 同时存在时浏览器行为不可预期。
 */
function setWaifuLeft(px, animate) {
    var el = document.querySelector('.waifu');
    if (!el) return;
    if (!animate) {
        // 瞬移：临时关掉过渡，改完立刻恢复
        var prev = el.style.transition;
        el.style.setProperty('transition', 'none', 'important');
        el.style.setProperty('left', px + 'px', 'important');
        el.style.setProperty('right', 'auto', 'important');
        void el.offsetWidth;                 // 强制重排，让上面的值立刻生效
        if (prev) el.style.setProperty('transition', prev);
        else el.style.removeProperty('transition');
    } else {
        el.style.setProperty('left', px + 'px', 'important');
        el.style.setProperty('right', 'auto', 'important');
    }
}

/**
 * 带动画地把看板娘移动到目标位置。
 *
 * ⚠️ 时长按【实际移动距离】缩放，而不是固定时长。
 *
 *    之前的做法是固定 duration（默认 1000ms）。只拖动一点点时，
 *    看板娘几乎没离开原位，却还要花 1 秒慢慢挪回去 —— 视觉上就是
 *    「先往回弹一下、再缓缓归位」，很像闪了一下。
 *
 *    现在：距离越短，时长越短（最短 120ms）。小幅移动几乎瞬间归位，
 *    大幅移动才用完整时长缓动，手感和 1.0.3 的 revertDuration 一致。
 *
 * @param {number} targetLeft 目标 left（px）
 * @param {number} maxDuration 最大动画时长（px 跨度较大时使用）
 * @param {function} onDone   动画结束回调
 */
function animateWaifuTo(targetLeft, maxDuration, onDone) {
    var el = document.querySelector('.waifu');
    if (!el) return;

    var startLeft = parseFloat(el.style.left);
    if (isNaN(startLeft)) startLeft = el.getBoundingClientRect().left;

    var distance = Math.abs(targetLeft - startLeft);
    var maxMs = maxDuration || 300;

    // 距离映射到时长：<40px 视为微调（立即归位），>=400px 用完整时长
    var duration;
    if (distance < 40) {
        duration = 120;
    } else if (distance >= 400) {
        duration = maxMs;
    } else {
        // 40~400px 线性插值
        duration = 120 + (distance - 40) / 360 * (maxMs - 120);
    }
    duration = Math.round(duration);

    // 用 CSS transition 而不是 requestAnimationFrame：
    // 更省 CPU，而且和样式表里的 transition 保持一致
    el.style.setProperty('transition', 'left ' + duration + 'ms cubic-bezier(0.33, 1, 0.68, 1)', 'important');
    setWaifuLeft(targetLeft, true);

    window.setTimeout(function () {
        if (el) el.style.removeProperty('transition');
        if (typeof onDone === 'function') onDone();
    }, duration + 20);
}

/** 应用停靠位置（工具栏也跟着镜像） */
function applyDockSide(side) {
    var tool = document.querySelector('.waifu-tool');
    if (!tool) return;
    if (side === 'left') {
        tool.classList.add('left-side');
        tool.style.setProperty('left', '10px');
        tool.style.setProperty('right', 'auto');
    } else {
        tool.classList.remove('left-side');
        tool.style.setProperty('right', '10px');
        tool.style.setProperty('left', 'auto');
    }
}

/** 根据当前配置 / 记住的位置，初始化看板娘位置 */
function initWaifuPosition() {
    var el = document.querySelector('.waifu');
    if (!el) return;

    var vw = document.documentElement.clientWidth  || window.innerWidth;
    var vh = document.documentElement.clientHeight || window.innerHeight;
    var ww = el.getBoundingClientRect().width  || 280;
    var wh = el.getBoundingClientRect().height || 250;

    // ---- 水平：决定停靠边 ----
    var side = null;
    if (live2d_settings.waifuDraggableSave) {
        var saved = storageGet('dockSide');
        if (saved === 'left' || saved === 'right') side = saved;
    }
    if (!side) {
        var cfg = live2d_settings.waifuEdgeSide;
        side = (typeof cfg === 'string' && cfg.indexOf(':') > -1) ? cfg.split(':')[0] : 'right';
    }

    // ---- 垂直：恢复记住的位置；没有就贴底 ----
    var savedTop = live2d_settings.waifuDraggableSave ? storageGet('top') : null;
    if (savedTop !== null && savedTop !== undefined && savedTop !== '') {
        var t = Math.max(0, Math.min(parseFloat(savedTop) || 0, vh - wh));
        el.style.setProperty('bottom', 'auto', 'important');
        el.style.setProperty('top', t + 'px', 'important');
    } else {
        el.style.setProperty('top', 'auto', 'important');
        el.style.setProperty('bottom', '0', 'important');
    }

    // ---- 水平位置：贴左或贴右 ----
    setWaifuLeft(side === 'left' ? 0 : vw - ww, false);
    applyDockSide(side);
}

/**
 * 初始化拖拽。
 * 只绑一次（用 __yyy404DragInited 标记），避免重复初始化。
 */
function initDraggable() {
    var mode = live2d_settings.waifuDraggable;
    if (mode === 'disable' || mode === 'none' || !mode) return;

    var el = document.querySelector('.waifu');
    if (!el || el.__yyy404DragInited) return;
    el.__yyy404DragInited = true;

    var isDragging = false;
    var moved = false;          // 区分「点击」和「拖拽」
    var startX = 0, startY = 0; // 按下时的鼠标坐标
    var baseLeft = 0, baseTop = 0;
    var curDx = 0, curDy = 0;   // 当前累计位移

    /** 当前可视区尺寸 */
    function viewport() {
        return {
            w: document.documentElement.clientWidth  || window.innerWidth,
            h: document.documentElement.clientHeight || window.innerHeight,
        };
    }
    /** 看板娘尺寸 */
    function size() {
        var r = el.getBoundingClientRect();
        return { w: r.width || 280, h: r.height || 250 };
    }
    /** 应用拖拽位移。用 transform —— 走 GPU 合成，不触发页面重排，所以不卡。 */
    function applyOffset(dx, dy) {
        el.style.setProperty('transform', 'translate3d(' + dx + 'px,' + dy + 'px,0)', 'important');
    }
    /** 清除拖拽位移 */
    function clearOffset() {
        el.style.removeProperty('transform');
    }

    // ---- 按下 ----
    el.addEventListener('pointerdown', function (e) {
        // 点在工具栏上不算拖拽
        if (e.target.closest && e.target.closest('.waifu-tool')) return;
        // 点在气泡框上也不算拖拽 —— 那里是文字，用户要能选中、复制。
        // ⚠️ 同时不能 preventDefault，否则浏览器会取消默认的文字选择行为。
        if (e.target.closest && e.target.closest('.waifu-tips')) return;
        // 只响应鼠标左键 / 触摸 / 笔
        if (e.pointerType === 'mouse' && e.button !== 0) return;

        var r = el.getBoundingClientRect();
        isDragging = true;
        moved = false;
        startX = e.clientX;
        startY = e.clientY;
        curDx = 0; curDy = 0;
        // 记住「不含当前 transform」的基准位置
        baseLeft = r.left;
        baseTop  = r.top;
        clearOffset();

        el.classList.add('dragging');
        // 捕获指针：鼠标移出窗口也能收到 move / up 事件
        try { el.setPointerCapture(e.pointerId); } catch (err) {}

        e.preventDefault();
    });

    // ---- 移动：只改 transform，两轴都跟手 ----
    el.addEventListener('pointermove', function (e) {
        if (!isDragging) return;

        var dx = e.clientX - startX;
        var dy = e.clientY - startY;

        // 超过 3px 才算拖拽，否则视为点击
        if (!moved && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) moved = true;
        if (!moved) return;

        // 限制在可视区内（基于基准位置 + 位移）
        var v = viewport(), s = size();
        curDx = Math.max(-baseLeft, Math.min(dx, v.w - s.w - baseLeft));
        curDy = Math.max(-baseTop,  Math.min(dy, v.h - s.h - baseTop));

        applyOffset(curDx, curDy);
    });

    // ---- 松开：水平吸附到最近的边缘；垂直停在原地 ----
    function endDrag(e) {
        if (!isDragging) return;
        isDragging = false;
        el.classList.remove('dragging');
        try { el.releasePointerCapture(e.pointerId); } catch (err) {}

        // 只是点了一下
        if (!moved) { clearOffset(); return; }

        var v = viewport(), s = size();
        var finalTop  = Math.max(0, Math.min(baseTop + curDy, v.h - s.h));
        var finalLeft = Math.max(0, Math.min(baseLeft + curDx, v.w - s.w));
        var finalSide = (finalLeft + s.w / 2 < v.w / 2) ? 'left' : 'right';
        var snapLeft  = (finalSide === 'left') ? 0 : v.w - s.w;

        // ① 把当前位置固定下来：transform 归零，垂直写进 top
        //    （水平先写实际值，下面再用动画吸到边缘）
        clearOffset();
        el.style.setProperty('bottom', 'auto', 'important');
        el.style.setProperty('top', finalTop + 'px', 'important');
        setWaifuLeft(finalLeft, false);

        // ② 只对水平做吸附动画；垂直保持不变
        animateWaifuTo(snapLeft, live2d_settings.waifuDraggableSnap || 300, function () {
            applyDockSide(finalSide);
        });
        applyDockSide(finalSide);

        if (live2d_settings.waifuDraggableSave) {
            storageSet('dockSide', finalSide);
            storageSet('top', Math.round(finalTop));
        }
    }

    el.addEventListener('pointerup', endDrag);
    el.addEventListener('pointercancel', endDrag);

    // ⚠️ 窗口尺寸变化：水平按停靠边重算，垂直按记忆值重算（都在可视区内）。
    //    必须把四个方向 + transform 全部重置，否则会残留拖拽期间设过的值。
    window.addEventListener('resize', function () {
        if (isDragging) return;
        clearOffset();
        var v = viewport(), s = size();

        var side = storageGet('dockSide');
        if (side !== 'left' && side !== 'right') {
            side = String(live2d_settings.waifuEdgeSide || 'right:0').split(':')[0];
        }

        // 垂直：有记忆就用记忆值，否则回到底部贴底
        var savedTop = storageGet('top');
        if (savedTop !== null && savedTop !== undefined && savedTop !== '') {
            var t = Math.max(0, Math.min(parseFloat(savedTop) || 0, v.h - s.h));
            el.style.setProperty('bottom', 'auto', 'important');
            el.style.setProperty('top', t + 'px', 'important');
        } else {
            el.style.setProperty('top', 'auto', 'important');
            el.style.setProperty('bottom', '0', 'important');
        }

        setWaifuLeft(side === 'left' ? 0 : v.w - s.w, false);
        applyDockSide(side);
    });
}

/* ============================================================================
 * 隐藏模式
 * ----------------------------------------------------------------------------
 * 点工具栏的「眼睛」图标进入 / 退出。
 *
 * 行为：
 *   进入隐藏模式 → 看板娘变半透明（默认 25%）
 *                  鼠标移上去 → 完全透明，且 pointer-events: none
 *                                （不遮挡页面上任何元素的点击）
 *                  鼠标移开 → 恢复半透明
 *   退出隐藏模式 → 完全恢复
 *
 * 为什么用「半透明」而不是「直接消失」：
 *   直接消失的话，用户会找不到按钮把它调回来。半透明既能达到
 *   「不挡视线、不挡点击」的目的，又保留了操作入口。
 * ========================================================================== */

function initHideMode() {
    var el = document.querySelector('.waifu');
    var canvas = document.querySelector('.waifu #live2d');
    if (!el || !canvas || el.__yyy404HideInited) return;
    el.__yyy404HideInited = true;

    var hidden = false;     // 是否处于隐藏模式
    var peeking = false;    // 鼠标是否正停在模型上

    /**
     * 应用当前状态。
     *
     * ⚠️ 隐藏的是【画布】而不是整个 .waifu：
     *    工具栏是 .waifu 的子元素，如果隐藏整个容器，工具栏也会消失，
     *    用户就再也点不到「眼睛」把功能关掉了。
     *
     * ⚠️ 为什么不用 pointerenter / pointerleave 驱动状态：
     *    画布一旦设成 pointer-events:none，就再也收不到 pointerleave；
     *    而鼠标「穿透」到下层元素又会引发新一轮 mouseover 冒泡，
     *    于是 waifu-tips.json 里针对 .waifu #live2d 的那条台词被反复触发，
     *    表现就是台词疯狂闪烁。
     *
     *    现在改成【单一事实来源】：只由 document 上的 mousemove 用坐标判定，
     *    不再监听画布自身的指针事件。判定结果没变就直接返回，
     *    从根上杜绝来回横跳。
     */
    function applyState() {
        var shouldHide = hidden && peeking;
        canvas.style.opacity = shouldHide ? '0' : '';
        // 模型隐藏时让出指针事件，这样不会挡住页面上的点击
        canvas.style.pointerEvents = shouldHide ? 'none' : '';
        // 供台词绑定处判读（见 loadTipsMessage 里的守卫）
        window.__waifuHiding = shouldHide;
        // 隐藏期间把台词气泡也收起来，避免它悬在半空
        if (shouldHide) {
            $('.waifu-tips').stop().fadeTo(120, 0);
        }
    }

    // 唯一的判定来源：鼠标坐标是否落在画布范围内。
    // 用 capture 阶段监听，避免被页面上其它 stopPropagation 打断。
    document.addEventListener('mousemove', function (e) {
        if (!hidden) return;
        var r = canvas.getBoundingClientRect();
        var inside = e.clientX >= r.left && e.clientX <= r.right &&
                     e.clientY >= r.top  && e.clientY <= r.bottom;
        // 状态没变就提前返回 —— 这是避免闪烁的关键
        if (inside === peeking) return;
        peeking = inside;
        applyState();
    }, true);

    // 鼠标移出整个文档时复位，防止卡在隐藏态
    document.addEventListener('mouseleave', function () {
        if (!hidden || !peeking) return;
        peeking = false;
        applyState();
    });


    // 「眼睛」按钮：切换隐藏模式
    $('.waifu-tool .el-icon-view').click(function () {
        hidden = !hidden;
        peeking = false;
        $(this).toggleClass('active', hidden);
        applyState();

        if (live2d_settings.showF12Status) {
            console.log('[Status]', '悬停隐藏', hidden ? '已开启' : '已关闭');
        }
    });

    applyState();
}

function initModel(waifuPath, type) {
    /* 控制台欢迎信息
       ⚠️ 原版这里是一段 packer 混淆代码（eval 自解压），改一个字都要重新打包。
          这里换成了明文，内容与文件头注释保持一致，改起来直观。 */
    if (live2d_settings.showF12Status) {
        console.log(
            '\n' +
            '    く__,.ヘヽ.　　　　/　,ー､ 〉\n' +
            '    　　　　　＼ \', !-─‐-i　/　/´\n' +
            '    　　　 　 ／｀ｰ\'　　　 L/／｀ヽ､            Live2D 看板娘 参数设置\n' +
            '    　　 　 /　 ／,　 /|　 ,　 ,　　　 \',                    静态化版\n' +
            '    　　　ｲ 　/ /-‐/　ｉ　L_ ﾊ ヽ!　 i                      v' + live2d_settings.l2dVersion + '\n' +
            '    　　　 ﾚ ﾍ 7ｲ｀ﾄ　 ﾚ\'ｧ-ﾄ､!ハ|　 |\n' +
            '    　　　　 !,/7 \'0\'　　 ´0iソ| 　 |             yyy404\n' +
            '    　　　　 |.从"　　_　　 ,,,, / |./ 　 |             https://github.com/whyyy-404\n' +
            '    　　　　 ﾚ\'| i＞.､,,__　_,.イ / 　.i 　|\n' +
            '    　　　　　 ﾚ\'| | / k_７_/ﾚ\'ヽ,　ﾊ.　|      Thanks\n' +
            '    　　　　　　 | |/i 〈|/　 i　,.ﾍ |　i　|        fghrsh / live2d_demo · live2d_api\n' +
            '    　　　　　　.|/ /　ｉ： 　 ﾍ!　　＼　|        stevenjoezhang / live2d-widget\n' +
            '    　　　 　 　 kヽ>､ﾊ 　 _,.ﾍ､ 　 /､!          journey-ad / xiazeyu / guansss\n' +
            '    　　　　　　 !\'〈//｀Ｔ´\', ＼ ｀\'7\'ｰr\'          jsDelivr · Element UI\n' +
            '    　　　　　　 ﾚ\'ヽL__|___i,___,ンﾚ|ノ          Live2d Cubism SDK & All model authors.\n' +
            '    　　　　　 　　　ﾄ-,/　|___./\n' +
            '    　　　　　 　　　\'ｰ\'　　!_,.:\n'
        );
        console.log(' Live2D 看板娘 v' + live2d_settings.l2dVersion + ' / yyy404 ' + live2d_settings.l2dVerDate);
        console.log(' ');
    }
    
    /* 判断 JQuery */
    if (typeof($.ajax) != 'function') typeof(jQuery.ajax) == 'function' ? window.$ = jQuery : console.log('[Error] JQuery is not defined.');
    
    /* 加载看板娘样式 */
    live2d_settings.waifuSize = live2d_settings.waifuSize.split('x');
    live2d_settings.waifuTipsSize = live2d_settings.waifuTipsSize.split('x');
    live2d_settings.waifuEdgeSide = live2d_settings.waifuEdgeSide.split(':');
    
    $("#live2d").attr("width",live2d_settings.waifuSize[0]);
    $("#live2d").attr("height",live2d_settings.waifuSize[1]);
    $(".waifu-tips").width(live2d_settings.waifuTipsSize[0]);
    $(".waifu-tips").height(live2d_settings.waifuTipsSize[1]);
    // ⚠️ 原版这里写的是 waifuToolTop，但作用在 .waifu-tips（气泡框）上 ——
    //    名字和作用对象对不上，是个笔误。本版拆成两个设置项。
    $(".waifu-tips").css("top",live2d_settings.waifuTipsTop);
    $(".waifu-tips").css("font-size",live2d_settings.waifuFontSize);
    $(".waifu-tool").css("top",live2d_settings.waifuToolTop);
    $(".waifu-tool").css("font-size",live2d_settings.waifuToolFont);
    $(".waifu-tool span").css("line-height",live2d_settings.waifuToolLine);
    
    if (live2d_settings.waifuEdgeSide[0] == 'left') $(".waifu").css("left",live2d_settings.waifuEdgeSide[1]+'px');
    else if (live2d_settings.waifuEdgeSide[0] == 'right') $(".waifu").css("right",live2d_settings.waifuEdgeSide[1]+'px');
    
    window.waifuResize = function() { $(window).width() <= Number(live2d_settings.waifuMinWidth.replace('px','')) ? $(".waifu").hide() : $(".waifu").show(); };
    if (live2d_settings.waifuMinWidth != 'disable') { waifuResize(); $(window).resize(function() {waifuResize()}); }
    
    // ⚠️ 原版这里用 jQuery UI 的 draggable，本版改为原生 Pointer Events（见 initDraggable）。
    //    拖拽和位置初始化统一在下面处理，这里不再做任何事。
    $(".waifu").css("transition", 'opacity .3s ease-in-out');
    
    live2d_settings.homePageUrl = live2d_settings.homePageUrl == 'auto' ? window.location.protocol+'//'+window.location.hostname+'/' : live2d_settings.homePageUrl;
    if (window.location.protocol == 'file:' && live2d_settings.modelAPI.substr(0,2) == '//') live2d_settings.modelAPI = 'http:'+live2d_settings.modelAPI;
    
    $('.waifu-tool .el-icon-house').click(function (){
        //window.location = 'https://www.fghrsh.net/';
        window.location = live2d_settings.homePageUrl;
    });

    $('.waifu-tool .el-icon-discover').click(function (){
        //window.open('https://imjad.cn/archives/lab/add-dynamic-poster-girl-with-live2d-to-your-blog-02');
        window.open(live2d_settings.aboutPageUrl);
    });
    
    if (typeof(waifuPath) == "object") loadTipsMessage(waifuPath); else {
        $.ajax({
            cache: true,
            url: waifuPath == '' ? live2d_settings.tipsMessage : (waifuPath.substr(waifuPath.length-15)=='waifu-tips.json'?waifuPath:waifuPath+'waifu-tips.json'),
            dataType: "json",
            success: function (result){ loadTipsMessage(result); }
        });
    }
    
    if (!live2d_settings.showToolMenu) $('.waifu-tool').hide();
    if (!live2d_settings.canCloseLive2d) $('.waifu-tool .el-icon-switch-button').hide();
    if (!live2d_settings.canSwitchModel) $('.waifu-tool .el-icon-user').hide();
    if (!live2d_settings.canSwitchTextures) $('.waifu-tool .el-icon-magic-stick').hide();
    if (!live2d_settings.canSwitchHitokoto) $('.waifu-tool .el-icon-chat-dot-round').hide();
    if (!live2d_settings.canTakeScreenshot) $('.waifu-tool .el-icon-camera').hide();
    if (!live2d_settings.canTurnToHomePage) $('.waifu-tool .el-icon-house').hide();
    if (!live2d_settings.canTurnToAboutPage) $('.waifu-tool .el-icon-discover').hide();
    if (!live2d_settings.canHideWaifu) $('.waifu-tool .el-icon-view').hide();

    // 初始化拖拽 / 隐藏模式 / 停靠位置（三个可选功能，各自独立）
    initWaifuPosition();
    initDraggable();
    initHideMode();

    if (waifuPath === undefined) waifuPath = '';

    // 读取上次的选择（用存储模块，带前缀与旧键迁移）
    var modelId = storageGet('modelId');
    var modelTexturesId = storageGet('modelTexturesId');

    if (!live2d_settings.modelStorage || modelId == null) {
        var modelId = live2d_settings.modelId;
        var modelTexturesId = live2d_settings.modelTexturesId;
    } loadModel(modelId, modelTexturesId);
}

function loadModel(modelId, modelTexturesId=0) {
    // 记录「当前正在显示」的模型 / 贴图。
    // ⚠️ 这个内存变量是必须的：换角色 / 换皮肤时要从「当前值」算出「下一个」，
    //    不能依赖存储 —— 因为 modelStorage=false 时根本不会写存储，
    //    而原版在这种情况下会读到 null，导致 ?id=undefined，切换逻辑彻底失效
    //    （表现：只能在最初的一两个模型之间打转）。
    currentModel = { id: parseInt(modelId, 10) || 1, texturesId: parseInt(modelTexturesId, 10) || 0 };

    if (live2d_settings.modelStorage) {
        // 记住选择（storage 模块会自动加前缀，并处理隐私模式等异常）
        storageSet('modelId', currentModel.id);
        storageSet('modelTexturesId', currentModel.texturesId);
    }
    loadlive2d('live2d', live2d_settings.modelAPI+'get/?id='+currentModel.id+'-'+currentModel.texturesId, (live2d_settings.showF12Status ? console.log('[Status]','live2d','模型',currentModel.id+'-'+currentModel.texturesId,'加载完成'):null));
}

function loadTipsMessage(result) {
    window.waifu_tips = result;
    
    $.each(result.mouseover, function (index, tips){
        $(document).on("mouseover", tips.selector, function (){
            // ⚠️ 隐藏模式下不再触发台词。
            //    否则：画布设成 pointer-events:none 后鼠标穿透到下层元素，
            //    mouseover 会随之下层元素反复触发，导致台词疯狂闪烁。
            if (window.__waifuHiding) return;
            var text = getRandText(tips.text);
            text = text.render({text: $(this).text()});
            // 普通消息：一言/换装反馈等重要消息显示期间会被忽略
            messageSystem.showNormal(text, 3000);
        });
    });
    $.each(result.click, function (index, tips){
        $(document).on("click", tips.selector, function (){
            var text = getRandText(tips.text);
            text = text.render({text: $(this).text()});
            showMessage(text, 3000, true);
        });
    });
    $.each(result.seasons, function (index, tips){
        var now = new Date();
        var after = tips.date.split('-')[0];
        var before = tips.date.split('-')[1] || after;
        
        if((after.split('/')[0] <= now.getMonth()+1 && now.getMonth()+1 <= before.split('/')[0]) && 
           (after.split('/')[1] <= now.getDate() && now.getDate() <= before.split('/')[1])){
            var text = getRandText(tips.text);
            text = text.render({year: now.getFullYear()});
            showMessage(text, 6000, true);
        }
    });
    
    if (live2d_settings.showF12OpenMsg) {
        re.toString = function() {
            showMessage(getRandText(result.waifu.console_open_msg), 5000, true);
            return '';
        };
    }
    
    if (live2d_settings.showCopyMessage) {
        $(document).on('copy', function() {
            showMessage(getRandText(result.waifu.copy_message), 5000, true);
        });
    }
    
    $('.waifu-tool .el-icon-camera').click(function(){
        showMessage(getRandText(result.waifu.screenshot_message), 5000, true);
        window.Live2D.captureName = live2d_settings.screenshotCaptureName;
        window.Live2D.captureFrame = true;
    });

    $('.waifu-tool .el-icon-switch-button').click(function(){
        sessionStorage.setItem('waifu-dsiplay', 'none');
        showMessage(getRandText(result.waifu.hidden_message), 1300, true);
        window.setTimeout(function() {$('.waifu').hide();}, 1300);
    });
    
    window.showWelcomeMessage = function(result) {
        var text;
        if (window.location.href == live2d_settings.homePageUrl) {
            var now = (new Date()).getHours();
            if (now > 23 || now <= 5) text = getRandText(result.waifu.hour_tips['t23-5']);
            else if (now > 5 && now <= 7) text = getRandText(result.waifu.hour_tips['t5-7']);
            else if (now > 7 && now <= 11) text = getRandText(result.waifu.hour_tips['t7-11']);
            else if (now > 11 && now <= 14) text = getRandText(result.waifu.hour_tips['t11-14']);
            else if (now > 14 && now <= 17) text = getRandText(result.waifu.hour_tips['t14-17']);
            else if (now > 17 && now <= 19) text = getRandText(result.waifu.hour_tips['t17-19']);
            else if (now > 19 && now <= 21) text = getRandText(result.waifu.hour_tips['t19-21']);
            else if (now > 21 && now <= 23) text = getRandText(result.waifu.hour_tips['t21-23']);
            else text = getRandText(result.waifu.hour_tips.default);
        } else {
            var referrer_message = result.waifu.referrer_message;
            if (document.referrer !== '') {
                var referrer = document.createElement('a');
                referrer.href = document.referrer;
                var domain = referrer.hostname.split('.')[1];
                if (window.location.hostname == referrer.hostname)
                    text = referrer_message.localhost[0] + document.title.split(referrer_message.localhost[2])[0] + referrer_message.localhost[1];
                else if (domain == 'baidu')
                    text = referrer_message.baidu[0] + referrer.search.split('&wd=')[1].split('&')[0] + referrer_message.baidu[1];
                else if (domain == 'so')
                    text = referrer_message.so[0] + referrer.search.split('&q=')[1].split('&')[0] + referrer_message.so[1];
                else if (domain == 'google')
                    text = referrer_message.google[0] + document.title.split(referrer_message.google[2])[0] + referrer_message.google[1];
                else {
                    $.each(result.waifu.referrer_hostname, function(i,val) {if (i==referrer.hostname) referrer.hostname = getRandText(val)});
                    text = referrer_message.default[0] + referrer.hostname + referrer_message.default[1];
                }
            } else text = referrer_message.none[0] + document.title.split(referrer_message.none[2])[0] + referrer_message.none[1];
        }
        showMessage(text, 6000);
    }; if (live2d_settings.showWelcomeMessage) showWelcomeMessage(result);
    
    var waifu_tips = result.waifu;
    
    function loadOtherModel() {
        var modelId = modelStorageGetItem('modelId');
        var modelRandMode = live2d_settings.modelRandMode;
        
        $.ajax({
            cache: modelRandMode == 'switch' ? true : false,
            url: live2d_settings.modelAPI+modelRandMode+'/?id='+modelId,
            dataType: "json",
            success: function(result) {
                loadModel(result.model['id']);
                var message = result.model['message'];
                $.each(waifu_tips.model_message, function(i,val) {if (i==result.model['id']) message = getRandText(val)});
                showMessage(message, 3000, true);
            }
        });
    }
    
    function loadRandTextures() {
        var modelId = modelStorageGetItem('modelId');
        var modelTexturesId = modelStorageGetItem('modelTexturesId');
        var modelTexturesRandMode = live2d_settings.modelTexturesRandMode;
        
        $.ajax({
            cache: modelTexturesRandMode == 'switch' ? true : false,
            url: live2d_settings.modelAPI+modelTexturesRandMode+'_textures/?id='+modelId+'-'+modelTexturesId,
            dataType: "json",
            success: function(result) {
                if (result.textures['id'] == 1 && (modelTexturesId == 1 || modelTexturesId == 0))
                    showMessage(waifu_tips.load_rand_textures[0], 3000, true);
                else showMessage(waifu_tips.load_rand_textures[1], 3000, true);
                loadModel(modelId, result.textures['id']);
            }
        });
    }
    
    /**
     * 读取「当前的模型 / 贴图 id」。
     *
     * ⚠️ 原版实现是：
     *      return live2d_settings.modelStorage ? localStorage.getItem(key) : sessionStorage.getItem(key);
     *    有三个毛病：
     *      1. 用的是裸 localStorage / sessionStorage，绕过了 storage 模块
     *         （因此读不到带 yyy404- 前缀的键，也读不到调用方自定义的存储）
     *      2. modelStorage=false 时读 sessionStorage，但 loadModel 那时并不写它
     *         → 永远读到 null → 换角色时拼出 ?id=undefined → 切换失效
     *      3. 「当前正在显示什么」其实是个运行时状态，不该每次都去查持久化存储
     *
     *    现在改为：优先用内存里的当前值（loadModel 每次都会更新），
     *    内存里没有才去存储里找（首次加载的场景）。
     */
    function modelStorageGetItem(key) {
        if (key === 'modelId' && currentModel.id) return String(currentModel.id);
        if (key === 'modelTexturesId') return String(currentModel.texturesId || 0);
        return storageGet(key);
    }

    
    /* 检测用户活动状态，并在空闲时显示一言 */
    // 只有配置了自动间隔才需要这套轮询；间隔为 0（默认）时一言完全手动，
    // 这里连每秒定时器都不注册，避免在被别人引用的页面上空跑。
    var _hitokotoGap = parseInt(live2d_settings.hitokotoInterval, 10);
    if (live2d_settings.showHitokoto && _hitokotoGap > 0) {
        window.getActed = false; window.hitokotoTimer = 0; window.hitokotoInterval = false;
        $(document).mousemove(function(e){getActed = true;}).keydown(function(){getActed = true;});
        setInterval(function(){ if (!getActed) ifActed(); else elseActed(); }, 1000);
    }
    
    function ifActed() {
        // 间隔为 0（或未设置）时不自动请求，只能手动点工具栏按钮
        var gap = parseInt(live2d_settings.hitokotoInterval, 10);
        if (!gap || gap <= 0) return;
        if (!hitokotoInterval) {
            hitokotoInterval = true;
            hitokotoTimer = window.setInterval(showHitokotoActed, gap);
        }
    }
    
    function elseActed() {
        getActed = hitokotoInterval = false;
        window.clearInterval(hitokotoTimer);
    }
    
    function showHitokotoActed() {
        if ($(document)[0].visibilityState == 'visible') showHitokoto();
    }
    
    /**
     * 一言的显示时长。
     *
     * 流程分两段：正文（6 秒）→ 出处信息（6 秒后出现，显示 3 秒）。
     * 整体锁 9 秒，正好覆盖两段，避免出处信息那一小段被悬停台词顶掉。
     *
     * ⚠️ 原来的实现是「正文 5 秒 + 出处 5 秒后出现」，但锁只持续 5 秒，
     *    出处信息一出现锁就过期了，鼠标一划就被「干嘛呢你，快把手拿开」顶掉。
     */
    var HITOKOTO_MAIN_MS = 6000;
    var HITOKOTO_LOCK_MS = HITOKOTO_MAIN_MS + 3000;

    /** 一言正文 + 延时显示出处信息，整体上锁 */
    function showHitokotoPair(mainText, sourceText) {
        messageSystem.showImportant(mainText, HITOKOTO_MAIN_MS, HITOKOTO_LOCK_MS);
        if (sourceText) {
            window.setTimeout(function () {
                messageSystem.showImportant(sourceText, 3000);
            }, HITOKOTO_MAIN_MS);
        }
    }

    /**
     * 一言接口的降级实现。
     * 当配置的接口不可用（跨域被拦、服务器关闭等）时调用，
     * 改用支持跨域的 v1.hitokoto.cn，避免点了「一言」没有任何反应。
     */
    function fallbackHitokoto() {
        $.getJSON('https://v1.hitokoto.cn', function (result) {
            var src = null;
            if (!empty(result.from)) {
                src = waifu_tips.hitokoto_api_message['hitokoto.cn'][0];
                src = src.render({source: result.from, creator: result.creator});
            }
            showHitokotoPair(result.hitokoto, src);
        });
    }

    function showHitokoto() {
    	switch(live2d_settings.hitokotoAPI) {
    	    case 'lwl12.com':
    	        // ⚠️ 这个接口没有返回 Access-Control-Allow-Origin，浏览器会拦截跨域请求。
    	        //    失败时自动回退到 hitokoto.cn，避免用户点了「一言」什么反应都没有。
    	        $.getJSON('https://api.lwl12.com/hitokoto/v1?encode=realjson',function(result){
        	        var src = null;
        	        if (!empty(result.source)) {
                        var text = waifu_tips.hitokoto_api_message['lwl12.com'][0];
                        if (!empty(result.author)) text += waifu_tips.hitokoto_api_message['lwl12.com'][1];
                        src = text.render({source: result.source, creator: result.author})
                              + waifu_tips.hitokoto_api_message['lwl12.com'][2];
                    }
                    showHitokotoPair(result.text, src);
                }).fail(function () {
                    fallbackHitokoto();
                });break;
    	    case 'fghrsh.net':
    	        // 同上：fghrsh 的接口早已关闭，失败时回退
    	        $.getJSON('https://api.fghrsh.net/hitokoto/rand/?encode=jsc&uid=3335',function(result){
            	    var src = null;
            	    if (!empty(result.source)) {
                        var text = waifu_tips.hitokoto_api_message['fghrsh.net'][0];
                        src = text.render({source: result.source, date: result.date});
            	    }
                    showHitokotoPair(result.hitokoto, src);
                }).fail(function () {
                    fallbackHitokoto();
                });break;
            case 'jinrishici.com':
                $.ajax({
                    url: 'https://v2.jinrishici.com/one.json',
                    xhrFields: {withCredentials: true},
                    success: function (result, status) {
                        var src = null;
                        if (!empty(result.data.origin.title)) {
                            var text = waifu_tips.hitokoto_api_message['jinrishici.com'][0];
                            src = text.render({title: result.data.origin.title, dynasty: result.data.origin.dynasty, author:result.data.origin.author});
                        }
                        showHitokotoPair(result.data.content, src);
                    }
                });break;
    	    default:
    	        $.getJSON('https://v1.hitokoto.cn',function(result){
            	    var src = null;
            	    if (!empty(result.from)) {
                        var text = waifu_tips.hitokoto_api_message['hitokoto.cn'][0];
                        src = text.render({source: result.from, creator: result.creator});
            	    }
                    showHitokotoPair(result.hitokoto, src);
                });
    	}
    }
    
    $('.waifu-tool .el-icon-user').click(function (){loadOtherModel()});
    $('.waifu-tool .el-icon-magic-stick').click(function (){loadRandTextures()});
    $('.waifu-tool .el-icon-chat-dot-round').click(function (){showHitokoto()});
}

/* ============================================================================
 * 导出到全局
 * ----------------------------------------------------------------------------
 * 这里用函数声明（function xxx(){}）定义的接口，在普通 <script> 里会自动
 * 成为 window 的属性，但在用户脚本的 @require 作用域里不会 —— 那是独立的
 * 包装函数作用域，外部拿不到。
 *
 * 所以显式挂一遍，让「网页直接引入」和「用户脚本 @require」两种用法都能
 * 拿到同一套 API。
 * ========================================================================== */

// 入口
window.initModel          = initModel;
window.loadModel          = loadModel;

// 消息
window.showMessage        = showMessage;
window.hideMessage        = hideMessage;
window.getRandText        = getRandText;
window.empty              = empty;

// 存储
window.getStorage         = getStorage;
window.storageGet         = storageGet;
window.storageSet         = storageSet;

// 位置与拖拽
window.setWaifuLeft       = setWaifuLeft;
window.animateWaifuTo     = animateWaifuTo;
window.applyDockSide      = applyDockSide;
window.initWaifuPosition  = initWaifuPosition;
window.initDraggable      = initDraggable;
window.initHideMode       = initHideMode;

// 台词
window.loadTipsMessage    = loadTipsMessage;
