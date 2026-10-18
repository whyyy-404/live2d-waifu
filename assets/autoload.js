/*!
 * yyy404 看板娘 · 一键引入脚本
 * ============================================================================
 * 用法：在网页 </body> 前加两行即可
 *
 *     <script src="https://cdn.jsdelivr.net/npm/jquery@3.3.1/dist/jquery.min.js"></script>
 *     <script src="https://cdn.jsdelivr.net/gh/你的用户名/你的仓库@main/assets/autoload.js"></script>
 *
 * 本脚本会自动完成：
 *   1. 引入 element-ui 图标样式（工具栏图标用）
 *   2. 引入 waifu.css（看板娘样式）
 *   3. 插入看板娘 HTML 骨架
 *   4. 依次加载 waifu-tips.js（逻辑）与 live2d.js（引擎）
 *   5. 调用 initModel() 启动
 *
 * ⚠️ 依赖 jQuery，必须在本文件之前引入。
 * ============================================================================
 */

(function () {
    'use strict';

    // ========================================================================
    // 配置区：改这里就行
    // ========================================================================

    // 资源根目录（改成你自己的仓库地址）
    // 结尾不要带斜杠
    var ASSETS = 'https://cdn.jsdelivr.net/gh/whyyy-404/live2d-waifu@main/assets';

    // 模型仓库（提供 models.json 与 model/ 目录）
    var MODELS = 'https://cdn.jsdelivr.net/gh/whyyy-404/live2d-models@main';

    // 看板娘默认参数
    var SETTINGS = {
        modelId: 1,             // 默认模型
        modelTexturesId: 0,     // 默认材质
        modelStorage: true,     // 记住用户切换的模型（刷新后恢复）
        modelRandMode: 'switch',        // 换模型：'switch'(顺序) / 'rand'(随机)
        modelTexturesRandMode: 'rand',  // 换皮肤：'rand'(随机) / 'switch'(顺序)
        hitokotoAPI: 'hitokoto.cn',     // 一言接口
        waifuEdgeSide: 'right:0',       // 停靠位置：'left:0' 或 'right:0'
        waifuMinWidth: '768px',         // 页面窄于此宽度时隐藏，'disable' 表示不隐藏
        aboutPageUrl: 'https://github.com/whyyy-404',  // 「关于」按钮跳转地址
        homePageUrl: 'auto',            // 「首页」按钮跳转地址，'auto' = 网站根目录
    };

    // ========================================================================
    // 以下不用改
    // ========================================================================

    /** 动态加载 CSS */
    function loadCSS(href) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
    }

    /** 动态加载 JS，返回 Promise */
    function loadJS(src) {
        return new Promise(function (resolve, reject) {
            var s = document.createElement('script');
            s.src = src;
            s.async = false;
            s.onload = resolve;
            s.onerror = function () { reject(new Error('加载失败: ' + src)); };
            document.head.appendChild(s);
        });
    }

    /** 插入看板娘 HTML 骨架 */
    function insertWaifuHTML() {
        if (document.querySelector('.waifu')) return;   // 避免重复插入

        var html =
            '<div class="waifu">' +
              // 台词气泡
              '<div class="waifu-tips"></div>' +
              // 画布
              '<canvas id="live2d" class="live2d" width="280" height="250"></canvas>' +
              // 工具栏（8 个按钮，顺序与 waifu-tips.js 的绑定一一对应）
              '<div class="waifu-tool">' +
                '<span class="el-icon-house"            title="首页"></span>' +
                '<span class="el-icon-chat-dot-round"   title="一言"></span>' +
                '<span class="el-icon-user"             title="换角色"></span>' +
                '<span class="el-icon-magic-stick"      title="换皮肤"></span>' +
                '<span class="el-icon-camera"           title="拍照"></span>' +
                '<span class="el-icon-view"             title="悬停隐藏"></span>' +
                '<span class="el-icon-discover"         title="关于"></span>' +
                '<span class="el-icon-switch-button"    title="关闭"></span>' +
              '</div>' +
            '</div>';

        var wrap = document.createElement('div');
        wrap.innerHTML = html;
        document.body.appendChild(wrap.firstChild);
    }

    /** 主流程 */
    function boot() {
        if (typeof jQuery === 'undefined') {
            console.error('[看板娘] 需要先引入 jQuery');
            return;
        }

        // ① 样式：element-ui 图标 + 看板娘样式
        loadCSS('https://cdn.jsdelivr.net/npm/element-ui/lib/theme-chalk/icon.css');
        loadCSS(ASSETS + '/waifu.css');

        // ② HTML 骨架
        insertWaifuHTML();

        // ③ 按正确顺序加载：引擎 → 静态 API → 控制逻辑
        //    ⚠️ live2d.js 必须最先，否则 live2d-static-api.js 劫持不到 loadlive2d
        loadJS(ASSETS + '/live2d.js')
            .then(function () { return loadJS(ASSETS + '/live2d-static-api.js'); })
            .then(function () { return loadJS(ASSETS + '/waifu-tips.js'); })
            .then(function () {
                // 应用配置
                Object.keys(SETTINGS).forEach(function (k) {
                    live2d_settings[k] = SETTINGS[k];
                });

                // 指向模型仓库（如果它提供 /api/ 形式的静态接口）
                // 若你的模型仓库不带 api/，则改用你自己的静态方案
                live2d_settings['modelAPI'] = MODELS + '/api/';

                // 启动
                initModel(ASSETS + '/waifu-tips.json');
            })
            .catch(function (e) {
                console.error('[看板娘] 初始化失败:', e);
            });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
