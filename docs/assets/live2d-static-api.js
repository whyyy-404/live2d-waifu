/**
 * live2d-static-api.js — 用纯静态数据替代 fghrsh 的 PHP API
 * ============================================================================
 *
 * 作用
 * ----------------------------------------------------------------------------
 * fghrsh 的 waifu-tips.js 通过 live2d_settings.modelAPI 请求这些 PHP 接口：
 *
 *   GET {modelAPI}get/?id=1-0                 加载模型（返回 index.json 内容）
 *   GET {modelAPI}switch/?id=1                换下一个模型
 *   GET {modelAPI}rand/?id=1                  随机换模型
 *   GET {modelAPI}rand_textures/?id=1-0       随机换贴图   *
 *   GET {modelAPI}switch_textures/?id=1-0     顺序换贴图
 *
 * 本模块在运行时把这些接口「本地实现」出来，数据来自静态文件 models.json，
 * 因此不再需要任何后端服务器。
 *
 * 实现：三层 hook
 * ----------------------------------------------------------------------------
 * 不改动 waifu-tips.js 一个字节，而是在它工作之前先接管三个地方：
 *
 *   ① XMLHttpRequest
 *        引擎要用 binary 读 index.json。换皮肤时我们在这里把响应体
 *        替换成「贴图已改好」的版本。
 *
 *   ② jQuery.$.ajax
 *        waifu-tips.js 用 $.ajax 调 switch / rand / *_textures 这些接口，
 *        全部由本地数据应答。
 *
 *   ③ window.loadlive2d
 *        它原本接收「API 地址」，我们改指向模型仓库里真实的 index.json。
 *        ⚠️ 这个函数的第二个参数必须是 URL 字符串，不能传数据对象 —
 *           引擎内部会做 substring/lastIndexOf 并当文件去加载。
 *
 * 一个必须知道的坑：引擎自带 URL 缓存
 * ----------------------------------------------------------------------------
 * live2d.js 内部：
 *     loadBytes = function (url, cb) {
 *         if (requestCache[url] !== undefined) { cb(requestCache[url]); return; }
 *         ...
 *     }
 * 它按完整 URL 缓存响应。换皮肤时如果 URL 不变，引擎会直接命中缓存、
 * 根本不发 XHR —— 我们第 ① 层的改写就没机会执行。
 * 因此模型地址一律带 ?_t=<时间戳>，强制每次都是新的 URL。
 *
 * 数据来源
 * ----------------------------------------------------------------------------
 *   models.json 结构（由 live2d-models 仓库的 build-models.js 生成）：
 *   {
 *     models: [{
 *       id, name, label, message, isGroup,
 *       variants: [{ name, label, index, textures, textureCount }]
 *     }]
 *   }
 *
 *   - variants      ：同组形态（如海王星 20 个角色、雫的 2 套衣服）
 *   - index         ：模型默认数据，路径以 ../model/<名字>/ 开头
 *   - textures[i]   ：第 i 套贴图（i 从 0 开始），是「路径数组」
 *   - textureCount  ：贴图总套数
 */

/* eslint-disable no-unused-vars */

/**
 * 创建静态 API。
 *
 * @param {object} opts
 * @param {string}   opts.base        models.json 与 model/ 所在的基础 URL
 * @param {object}   opts.data        已解析的 models.json 内容
 * @param {function} opts.onLog        日志回调（可选）
 * @returns {object} 控制器对象
 */
function createStaticModelAPI(opts) {
    var base = String(opts.base || '').replace(/\/+$/, '') + '/';
    var normBase = normalizeBase(base);
    var data = opts.data;
    var log = opts.onLog || function () {};

    if (!data || !Array.isArray(data.models) || !data.models.length) {
        throw new Error('[Live2D] models.json 内容无效');
    }

    /**
     * 把 base 规范化成一个「绝对」URL。
     * new URL(relative, base) 要求 base 本身是绝对地址；如果调用方传了相对路径
     * （比如本地测试页传 '../live2d-models/'），需要先以当前页面为基准补全。
     */
    function normalizeBase(b) {
        var s = String(b || '');
        if (/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) return s;   // 已是绝对 URL
        // 否则以当前文档为基准解析（file:// 或 http:// 都可以）
        try {
            return new URL(s, document.baseURI || window.location.href).href;
        } catch (e) {
            return s;
        }
    }

    /** 把数据里的相对路径（../model/xxx）解析成绝对 URL */
    function resolve(p) {
        if (!p) return p;
        if (/^(https?:)?\/\//i.test(p) || p.indexOf('data:') === 0) return p;
        // 数据里是 '../model/...'。build-models.js 输出的路径本就是「拼在 base 上」的，
        // 所以先把开头的 '../' 去掉，再相对 base 解析。
        var rel = String(p).replace(/^\.\.\//, '');
        try {
            return new URL(rel, normBase).href;
        } catch (e) {
            // base 实在无法解析时原样返回，让上层看到问题而不是静默出错
            console.warn('[Live2D] 无法解析路径:', p, '(base=' + base + ')');
            return p;
        }
    }

    /** 深度解析模型数据里所有路径为绝对 URL */
    function absolutize(index) {
        var out = JSON.parse(JSON.stringify(index));
        if (Array.isArray(out.textures)) out.textures = out.textures.map(resolve);
        if (out.model) out.model = resolve(out.model);
        if (out.pose) out.pose = resolve(out.pose);
        if (out.physics) out.physics = resolve(out.physics);
        if (out.motions) {
            Object.keys(out.motions).forEach(function (k) {
                (out.motions[k] || []).forEach(function (m) {
                    if (m && typeof m === 'object') {
                        if (m.file) m.file = resolve(m.file);
                        if (m.sound) m.sound = resolve(m.sound);
                    }
                });
            });
        }
        if (out.expressions) {
            Object.keys(out.expressions).forEach(function (k) {
                var e = out.expressions[k];
                if (e && e.file) e.file = resolve(e.file);
            });
        }
        return out;
    }

    // ============ 数据访问 ============

    /** 按 id（1-based）取模型条目 */
    function modelById(id) {
        var n = parseInt(id, 10);
        return data.models.find(function (m) { return m.id === n; }) || null;
    }

    /**
     * 取某个模型在指定贴图 id 下要加载的 index 数据。
     * 完全对应 PHP 的 get/index.php：
     *   - 分组模型：texturesId 选的是「形态」（variant）
     *   - 普通模型：texturesId 选的是「贴图套」
     */
    function getModelIndex(modelId, texturesId) {
        var m = modelById(modelId);
        if (!m) return null;

        var tid = parseInt(texturesId, 10) || 0;

        if (m.isGroup) {
            // 分组：tid 是形态序号（1-based）；0 或越界 → 第一个
            var vi = tid > 0 ? tid - 1 : 0;
            var v = m.variants[vi] || m.variants[0];
            return absolutize(v.index);
        }

        // 普通模型：只有 1 个 variant，tid 用来选贴图
        var variant = m.variants[0];
        var out = JSON.parse(JSON.stringify(variant.index));
        if (tid > 0 && variant.textures && variant.textures[tid - 1]) {
            out.textures = variant.textures[tid - 1];
        }
        return absolutize(out);
    }

    /** 贴图总数（分组模型返回形态数，对应 PHP 行为） */
    function textureCount(modelId) {
        var m = modelById(modelId);
        if (!m) return 1;
        if (m.isGroup) return m.variants.length;
        return m.variants[0].textureCount || 1;
    }

    /** 换下一个模型（对应 switch/index.php） */
    function switchModel(id) {
        var n = parseInt(id, 10);
        var next = n + 1;
        if (!modelById(next)) next = 1;
        var m = modelById(next);
        return { id: next, name: m.name, message: m.message };
    }

    /**
     * 随机换模型（对应 rand/index.php）
     *
     * PHP 会循环随机直到「与当前不同」：
     *     while ($new) { $id = rand(0, n-1)+1; $new = $id == $modelId; }
     * 不排除当前模型的话，点「换角色」有 1/n 的概率换到同一个，看起来像点了没反应。
     */
    function randModel(currentId) {
        var n = data.models.length;
        if (n <= 1) {
            var only = data.models[0];
            return { id: only.id, name: only.name, message: only.message };
        }
        var cur = parseInt(currentId, 10);
        var m;
        do {
            m = data.models[Math.floor(Math.random() * n)];
        } while (m.id === cur);
        return { id: m.id, name: m.name, message: m.message };
    }

    /**
     * 换贴图（对应 rand_textures / switch_textures）
     *
     * ⚠️ 必须严格照抄 fghrsh 的 PHP 语义，否则「贴图 id 判重」会出错：
     *
     *   switch_textures/index.php 第 18-19 行：
     *       $modelTexturesNewId = $modelTexturesId == 0 ? 2 : $modelTexturesId + 1;
     *       if (!isset($list[$newId-1])) $modelTexturesNewId = 1;
     *
     *   注意 `== 0 ? 2` —— 当前 id 是 0（默认贴图）时，下一套是 2 而不是 1。
     *   若错写成 1，waifu-tips.js 会判定「切换前后都是第 1 套」，
     *   于是弹出「我还没有其他衣服呢」，但模型其实有几十套衣服。
     *
     *   rand_textures/index.php 第 19-28 行：
     *       只有 1 套 → 直接返回 1
     *       否则 → 随机到「与当前不同」的一套（0 视作 1）
     *   不排除当前的话，点换皮肤可能随机到同一套，看起来就是「点了没反应」。
     */
    function switchTextures(modelId, texturesId, mode) {
        var total = textureCount(modelId);
        var cur = parseInt(texturesId, 10) || 0;
        var next;

        if (mode === 'switch') {
            // 与 PHP 一致：0 视作「还没切换过」，直接跳到第 2 套
            next = (cur === 0) ? 2 : cur + 1;
            if (next > total) next = 1;
        } else {
            // 与 PHP 一致：只有一套时固定返回 1
            if (total <= 1) return 1;
            var curNorm = (cur === 0) ? 1 : cur;   // PHP 把 0 当成 1
            do {
                next = Math.floor(Math.random() * total) + 1;
            } while (next === curNorm);
        }
        return next;
    }

    // ============ 劫持 jQuery.ajax ============
    // waifu-tips.js 用 $.ajax({url: modelAPI + 'switch/?id=N'}) 这类调用，
    // 我们在这里拦下来，本地应答，避免真的发请求。

    function installAjaxHook() {
        if (typeof window.jQuery === 'undefined') return false;
        var $ = window.jQuery;
        if ($.__live2dStaticHooked) return true;

        var origAjax = $.ajax;

        $.ajax = function (urlOrOpts) {
            var opts = (typeof urlOrOpts === 'string') ? { url: urlOrOpts } : (urlOrOpts || {});
            var url = String(opts.url || '');

            // 只处理打到这套模型数据的请求
            var handled = matchApiCall(url);
            if (!handled) return origAjax.apply(this, arguments);

            log('本地应答:', url);

            // 模拟异步，保持和真实 AJAX 一样的时序
            setTimeout(function () {
                if (typeof opts.success === 'function') opts.success(handled);
                if (typeof opts.complete === 'function') opts.complete({ status: 200 });
            }, 0);

            return { done: function () { return this; }, fail: function () { return this; }, always: function () { return this; } };
        };

        $.__live2dStaticHooked = true;
        return true;
    }

    /** 解析 API 调用，返回本地数据；不是我们的请求则返回 null */
    function matchApiCall(url) {
        // ⚠️ 长选项必须排在短选项前面！
        //    正则里的 | 是「先匹配先赢」。如果 rand 写在 rand_textures 之前，
        //    ".../rand_textures/?id=1-0" 会被 rand 抢先吃掉，
        //    剩下的 "_textures/?id=..." 解析不出 id，
        //    于是「换皮肤」被当成「换模型」执行 —— 表现就是点换皮肤却换了角色。
        var m = url.match(/\/(rand_textures|switch_textures|get|switch|rand)\/\?(.*)$/);
        if (!m) return null;

        var action = m[1];
        var q = {};
        m[2].split('&').forEach(function (kv) {
            var i = kv.indexOf('=');
            if (i > 0) q[kv.slice(0, i)] = decodeURIComponent(kv.slice(i + 1));
        });

        var parts = String(q.id || '').split('-');
        var mid = parseInt(parts[0], 10);
        var tid = parseInt(parts[1], 10) || 0;

        if (action === 'get') {
            var idx = getModelIndex(mid, tid);
            return idx || null;
        }
        if (action === 'switch') return { model: switchModel(mid) };
        if (action === 'rand') return { model: randModel(mid) };
        if (action === 'rand_textures') return { textures: { id: switchTextures(mid, tid, 'rand') } };
        if (action === 'switch_textures') return { textures: { id: switchTextures(mid, tid, 'switch') } };
        return null;
    }

    // ============ 劫持 loadlive2d ============
    // ⚠️ 关键约束：loadlive2d 的第二个参数必须是【URL 字符串】，不能传对象。
    //
    // 看 live2d.js 内部实现：
    //   load(url) {
    //       this.modelHomeDir = url.substring(0, url.lastIndexOf('/') + 1);
    //       modelSetting.loadModelSetting(url, cb);      // 内部走 XMLHttpRequest
    //       ...
    //       var t = r.modelHomeDir + r.modelSetting.getModelFile();   // ← 无条件拼接
    //   }
    //
    // 所以引擎是「把 url 当文件去 XHR 拉」，并且用 url 的目录部分（modelHomeDir）
    // 去拼 model.moc。传对象会立刻报 "i.lastIndexOf is not a function"。
    //
    // ---------------------------------------------------------------------------
    // 方案：让引擎请求「这个模型真实存在的 index.json」。
    //
    //   我们的模型仓库里，每个模型本来就有 index.json（就是引擎想要的那份数据），
    //   而 build-models.js 输出的 models.json 只是把这些 index.json 聚合 + 展开路径。
    //
    //   但 index.json 里的路径是【相对】的（如 "model.moc"、"textures/a.png"），
    //   而模型仓库的目录结构是 model/<名字>/index.json ——
    //   index.json 就在模型目录里，相对路径正好成立！
    //
    //   于是：直接把引擎指向
    //       <modelBase>/model/Potion-Maker/Pio/index.json
    //   引擎会算出 modelHomeDir = ".../model/Potion-Maker/Pio/"
    //   然后拼出 ".../model/Potion-Maker/Pio/model.moc" —— 完全正确。
    //
    //   ⚠️ 唯一的差异：原版 API 会把贴图替换成「指定第 N 套」，
    //      而裸 index.json 只有默认贴图。所以换装需要额外处理 ——
    //      见下面的 textureOverride 机制。
    // ---------------------------------------------------------------------------

    /**
     * 换装支持：引擎读的是磁盘上的 index.json，我们没法改它。
     * 但引擎拿到的 index.json 内容会先经过 loadModelSetting → JSON.parse。
     *
     * 做法：记录「当前 modelId-texturesId 应该用哪套贴图」，
     * 然后在 XHR 层面把 index.json 的响应改写成「替换过 textures 的版本」。
     * 这样引擎算出的 modelHomeDir 依然正确（因为 URL 没变），
     * 只是拿到的贴图列表是我们指定的那一套。
     */
    var pendingTextures = null;   // { url, textures: [...] }

    function installXHRHook() {
        // 注意：浏览器里 window === 全局对象，但为了在各种宿主环境（含单元测试）
        // 里都能工作，这里同时检查 window 和全局。
        var W = (typeof window !== 'undefined') ? window : (typeof globalThis !== 'undefined' ? globalThis : this);
        if (W.__live2dXHRHooked) return true;
        var OrigXHR = W.XMLHttpRequest;
        if (!OrigXHR) return false;

        function HookedXHR() {
            var xhr = new OrigXHR();
            var self = this;
            this._xhr = xhr;

            // 被改写时的替代响应。
            // ⚠️ 不能对真实的 xhr 用 defineProperty 覆盖 response/responseText ——
            //    那些在原型上是只读 getter，重定义会抛错（而且很容易被 catch 吞掉）。
            //    这里用闭包变量存，由下面的 getter 优先返回。
            var override = null;   // { response, responseText, status, readyState }
            var realUrl = '';

            this.open = function (method, url) {
                realUrl = String(url);
                return xhr.open.apply(xhr, arguments);
            };

            this.send = function () {
                // 只拦截「待改写的那份 index.json」
                if (pendingTextures && realUrl === pendingTextures.url) {
                    var target = pendingTextures;
                    pendingTextures = null;   // 一次性生效

                    if (log) log('命中改写:', realUrl);

                    var json = JSON.stringify(target.payload);
                    var dataUrl = 'data:application/json;base64,' +
                        W.btoa(unescape(encodeURIComponent(json)));

                    var inner = new OrigXHR();
                    inner.open('GET', dataUrl, true);
                    // ⚠️ 内部请求一律用 text 读，再由我们按调用方要的类型去转换。
                    //    不能直接沿用 xhr.responseType：如果它是 'arraybuffer'，
                    //    读 responseText 会抛 InvalidStateError。
                    inner.responseType = 'text';
                    inner.onload = function () {
                        var text = inner.responseText;

                        // 按调用方请求的 responseType 准备对应类型的响应体
                        var outResponse;
                        var rt = xhr.responseType || '';
                        if (rt === 'arraybuffer') {
                            outResponse = textToArrayBuffer(text);
                        } else if (rt === 'json') {
                            try { outResponse = JSON.parse(text); }
                            catch (e) { outResponse = null; }
                        } else {
                            outResponse = text;   // '' 或 'text'
                        }

                        override = {
                            response: outResponse,
                            responseText: text,     // 仅当 rt 为 ''/'text' 时才允许被读
                            status: 200,
                            readyState: 4,
                        };

                        // 触发挂在【包装对象】上的回调（引擎挂的是这个）
                        var ev = { target: self, currentTarget: self };
                        if (typeof self.onreadystatechange === 'function') self.onreadystatechange.call(self, ev);
                        if (typeof self.onload === 'function') self.onload.call(self, ev);
                        if (typeof self.onloadend === 'function') self.onloadend.call(self, ev);
                    };
                    inner.onerror = function () {
                        var ev = { target: self, currentTarget: self };
                        if (typeof self.onerror === 'function') self.onerror.call(self, ev);
                        if (typeof self.onloadend === 'function') self.onloadend.call(self, ev);
                    };
                    inner.send(null);
                    return;
                }
                // 有待改写的目标，但 URL 对不上（通常是引擎换了请求地址）
                if (pendingTextures && realUrl !== pendingTextures.url && log) {
                    log('URL 未匹配，期望:', pendingTextures.url, '实际:', realUrl);
                }
                return xhr.send.apply(xhr, arguments);
            };

            // 转发其余常用成员
            ['abort', 'setRequestHeader', 'getResponseHeader', 'getAllResponseHeaders',
             'overrideMimeType', 'addEventListener', 'removeEventListener'].forEach(function (k) {
                self[k] = function () {
                    return xhr[k].apply(xhr, arguments);
                };
            });

            // 可读写属性
            ['responseType', 'timeout', 'withCredentials'].forEach(function (k) {
                Object.defineProperty(self, k, {
                    get: function () { return xhr[k]; },
                    set: function (v) { xhr[k] = v; },
                    configurable: true,
                });
            });
            // 只读属性：有 override 时优先返回 override
            Object.defineProperty(self, 'response', {
                get: function () { return override ? override.response : xhr.response; },
                configurable: true,
            });
            Object.defineProperty(self, 'responseText', {
                get: function () {
                    var rt = xhr.responseType || '';
                    // ⚠️ 复刻浏览器的规则：responseType 不是 ''/'text' 时读 responseText 会抛错。
                    //    如果不模拟这个行为，某些依赖它的库会拿到不该拿的值。
                    if (!override) return xhr.responseText;
                    if (rt !== '' && rt !== 'text') {
                        throw new DOMException(
                            "Failed to read the 'responseText' property from 'XMLHttpRequest': " +
                            "The value is only accessible if the object's 'responseType' is '' or 'text' " +
                            "(was '" + rt + "').",
                            'InvalidStateError'
                        );
                    }
                    return override.responseText;
                },
                configurable: true,
            });
            Object.defineProperty(self, 'status', {
                get: function () { return override ? override.status : xhr.status; },
                configurable: true,
            });
            Object.defineProperty(self, 'readyState', {
                get: function () { return override ? override.readyState : xhr.readyState; },
                configurable: true,
            });
            Object.defineProperty(self, 'statusText', {
                get: function () { return xhr.statusText; },
                configurable: true,
            });
            Object.defineProperty(self, 'responseURL', {
                get: function () { return xhr.responseURL || realUrl; },
                configurable: true,
            });
            // 事件处理器：挂在内部 xhr 上，由上面的 inner.onload 负责转调
            ['onload', 'onerror', 'onprogress', 'ontimeout', 'onabort', 'onreadystatechange', 'onloadend']
                .forEach(function (k) {
                    Object.defineProperty(self, k, {
                        get: function () { return xhr[k]; },
                        set: function (v) { xhr[k] = v; },
                        configurable: true,
                    });
                });
        }

        HookedXHR.prototype = OrigXHR.prototype;
        W.XMLHttpRequest = HookedXHR;
        W.__live2dXHRHooked = true;
        return true;
    }

    /**
     * 把模型数据里的路径统一转成「相对模型目录」的形式。
     *
     * 引擎拿到的 index.json 位于  <modelBase>/model/<名字>/index.json
     * 它按 modelHomeDir + 相对路径 来拼资源地址，所以里面的路径必须是
     * 相对该模型目录的，例如 "model.moc"、"textures/a.png"。
     *
     * 输入可能有两种形态：
     *   ① 绝对 URL：      https://cdn/.../model/Potion-Maker/Pio/textures/a.png
     *   ② 构建期生成的原样： ../model/Potion-Maker/Pio/textures/a.png
     *
     * ⚠️ 之前只处理了 ①，漏了 ②，导致换皮肤时数据里仍是 "../model/..."
     *    引擎再拼一次 modelHomeDir，就成了
     *        .../Pio/../model/Potion-Maker/Pio/model.moc   → 404
     */
    function relativize(index, modelDirUrl, modelName) {
        var prefix = modelDirUrl.replace(/\/+$/, '') + '/';
        // 构建期路径统一以 ../model/ 开头
        var buildPrefix = '../model/' + modelName + '/';

        function strip(u) {
            if (typeof u !== 'string') return u;
            // ① 绝对 URL
            if (u.indexOf(prefix) === 0) return u.slice(prefix.length);
            // ② 构建期原样路径
            if (u.indexOf(buildPrefix) === 0) return u.slice(buildPrefix.length);
            // ③ 已经是干净的相对路径，原样返回
            if (u.indexOf('../') !== 0 && u.indexOf('/') !== 0 &&
                !/^[a-z][a-z0-9+.-]*:\/\//i.test(u)) {
                return u;
            }
            // ④ 其它情况：去掉开头的 ../ 或 ./
            return u.replace(/^\.\//, '').replace(/^(\.\.\/)+/, '');
        }

        var out = JSON.parse(JSON.stringify(index));
        if (Array.isArray(out.textures)) out.textures = out.textures.map(strip);
        out.model = strip(out.model);
        if (out.pose) out.pose = strip(out.pose);
        if (out.physics) out.physics = strip(out.physics);
        if (out.motions) {
            Object.keys(out.motions).forEach(function (k) {
                (out.motions[k] || []).forEach(function (m) {
                    if (m && typeof m === 'object') {
                        if (m.file) m.file = strip(m.file);
                        if (m.sound) m.sound = strip(m.sound);
                    }
                });
            });
        }
        if (out.expressions) {
            Object.keys(out.expressions).forEach(function (k) {
                var e = out.expressions[k];
                if (e && e.file) e.file = strip(e.file);
            });
        }
        return out;
    }

    /** 计算某个模型的 index.json 在仓库里的绝对 URL */
    function indexUrlOf(modelName) {
        return normBase + 'model/' + modelName + '/index.json';
    }

    /**
     * 把字符串转成 ArrayBuffer（UTF-8）。
     * Live2D 引擎读模型文件时用 responseType='arraybuffer'，
     * 而我们改写后的内容是文本，需要转成它期望的类型。
     */
    function textToArrayBuffer(text) {
        // 优先用 TextEncoder（现代浏览器都有）
        if (typeof TextEncoder !== 'undefined') {
            return new TextEncoder().encode(text).buffer;
        }
        // 兜底：手工按 UTF-8 编码
        var utf8 = unescape(encodeURIComponent(text));
        var buf = new ArrayBuffer(utf8.length);
        var view = new Uint8Array(buf);
        for (var i = 0; i < utf8.length; i++) view[i] = utf8.charCodeAt(i);
        return buf;
    }

    /**
     * 返回某个模型应加载的 index.json 绝对 URL，并登记「要用哪套贴图」。
     *
     * ⚠️ 这是交给 live2d.js 的正确入参 —— 引擎要的是【URL 字符串】而不是数据对象。
     *    它内部会：
     *      modelHomeDir = url.substring(0, url.lastIndexOf('/') + 1)
     *      modelHomeDir + index.json 里的 "model.moc"
     *    所以只要给的是「模型目录下的 index.json」，路径就自然拼对。
     */
    function apiUrlFor(modelId, texturesId) {
        var m = modelById(modelId);
        if (!m) return null;

        var tid = parseInt(texturesId, 10) || 0;
        var variant = m.isGroup
            ? (m.variants[(tid > 0 ? tid - 1 : 0)] || m.variants[0])
            : m.variants[0];

        var idxUrl = indexUrlOf(variant.name);

        // 普通模型 + 指定了贴图套 → 需要改写 textures
        var needRewrite = !m.isGroup && tid > 0 &&
                          variant.textures && variant.textures[tid - 1];

        if (needRewrite) {
            // ⚠️ 只有在需要改写时才加唯一参数。
            //
            //    live2d.js 内部有 requestCache，按「完整 URL」缓存：
            //        loadBytes = function (url, cb) {
            //            if (requestCache[url] !== undefined) { cb(requestCache[url]); return; }
            //            ...
            //        }
            //    换皮肤时如果不加参数，引擎直接命中缓存、根本不发 XHR，
            //    改写层就没机会执行（表现为「点了换皮肤，画面不变」）。
            //
            //    但首次加载和换角色（tid = 0）并不需要改写 ——
            //    这种情况如果也加时间戳，等于每次都换新 URL，
            //    浏览器缓存与引擎缓存全部失效，模型反复重新下载，加载明显变慢。
            //    所以只在 needRewrite 时才加。
            idxUrl += '?_t=' + Date.now();

            var modelDir = normBase + 'model/' + variant.name + '/';
            var payload = relativize(variant.index, modelDir, variant.name);
            payload.textures = variant.textures[tid - 1].map(function (t) {
                // 贴图同样可能是 "../model/<名字>/textures/x.png" 或绝对 URL
                if (t.indexOf(modelDir) === 0) return t.slice(modelDir.length);
                var bp = '../model/' + variant.name + '/';
                if (t.indexOf(bp) === 0) return t.slice(bp.length);
                return t.replace(/^(\.\.\/)+/, '');
            });
            pendingTextures = { url: idxUrl, payload: payload };
        } else {
            pendingTextures = null;
        }
        return idxUrl;
    }

    function installLoadlive2dHook() {
        if (typeof window.loadlive2d !== 'function') return false;
        if (window.loadlive2d.__live2dStaticHooked) return true;

        var orig = window.loadlive2d;

        window.loadlive2d = function (canvasId, url, callback) {
            var parsed = parseGetUrl(url);
            if (!parsed) return orig.apply(this, arguments);

            var idxUrl = apiUrlFor(parsed.modelId, parsed.texturesId);
            if (!idxUrl) {
                log('模型不存在:', parsed.modelId);
                return orig.apply(this, arguments);
            }

            log('本地加载模型:', parsed.modelId + '-' + parsed.texturesId, '→', idxUrl);
            return orig.call(this, canvasId, idxUrl, callback);
        };

        window.loadlive2d.__live2dStaticHooked = true;
        return true;
    }

    /** 从 API URL 里取出 modelId / texturesId */
    function parseGetUrl(url) {
        var m = String(url).match(/get\/\?id=(\d+)-(\d+)/);
        if (!m) return null;
        return { modelId: parseInt(m[1], 10), texturesId: parseInt(m[2], 10) };
    }

    // ============ 对外接口 ============

    return {
        base: base,
        data: data,
        getModelIndex: getModelIndex,
        switchModel: switchModel,
        randModel: randModel,
        switchTextures: switchTextures,
        textureCount: textureCount,
        installAjaxHook: installAjaxHook,
        installLoadlive2dHook: installLoadlive2dHook,
        installXHRHook: installXHRHook,
        apiUrlFor: apiUrlFor,
        /** 一次性装好所有 hook */
        install: function () {
            var x = installXHRHook();       // ① 先装 XHR（换装改写依赖它）
            var a = installAjaxHook();      // ② 拦截 $.ajax 形式的 API 调用
            var b = installLoadlive2dHook(); // ③ 把模型加载指向静态 index.json
            return { xhr: x, ajax: a, loadlive2d: b };
        },
        /** 统计信息，方便调试 */
        stats: function () {
            return {
                models: data.models.length,
                variants: data.models.reduce(function (n, m) { return n + m.variants.length; }, 0),
            };
        },
    };
}

window.createStaticModelAPI = createStaticModelAPI;
