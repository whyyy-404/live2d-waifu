# Live2D 看板娘 · 库

一套**开箱即用**的网页 Live2D 看板娘库。**三行代码接入，不需要任何后端服务器。**

基于 [fghrsh/live2d_demo](https://github.com/fghrsh/live2d_demo) 改造，
把原来需要调用方自己补的样式、图标、交互**全部收进库文件**，做到「引用即用」。

---

## 特性

| | 说明 |
|---|---|
| 🎨 **气泡框** | 白底圆角 + 指向看板娘的小三角箭头 + 多行自动换行 + 淡入动画 |
| 🖱️ **拖拽** | 原生 Pointer Events 实现，**不依赖 jQuery UI**；支持触摸屏；松手吸附到边缘 |
| 👁️ **悬停隐藏** | 鼠标移上去模型让位，不挡页面操作 |
| 💾 **记忆位置** | 拖到哪、选的哪个模型，刷新后还在 |
| 🔌 **存储可替换** | 默认 localStorage，可换成 GM 存储 / 服务端 / 不存储 |
| 🚫 **零后端** | 模型数据是静态 JSON，不需要 PHP / 服务器 / 域名 |

---

## 快速开始

在网页 `</body>` 前加两行：

```html
<script src="https://cdn.jsdelivr.net/npm/jquery@3.3.1/dist/jquery.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/whyyy-404/live2d-waifu@main/assets/autoload.js"></script>
```

`autoload.js` 会自动完成：

1. 引入 element-ui 图标样式 + `waifu.css`
2. 插入看板娘 HTML 骨架
3. 按正确顺序加载 `live2d.js` → `live2d-static-api.js` → `waifu-tips.js`
4. 调用 `initModel()` 启动

### 改配置

编辑 `autoload.js` 顶部的三个对象：

```js
var ASSETS = 'https://cdn.jsdelivr.net/gh/whyyy-404/live2d-waifu@main/assets';
var MODELS = 'https://cdn.jsdelivr.net/gh/whyyy-404/live2d-models@main';

var SETTINGS = {
    modelId: 1,
    modelTexturesId: 0,
    waifuEdgeSide: 'right:0',
    aboutPageUrl: 'https://github.com/whyyy-404',
    // ...
};
```

---

## 文件说明

```
assets/
├── autoload.js            一键引入脚本（推荐入口）
├── waifu-tips.js          控制逻辑：加载模型、交互、工具栏、台词
├── waifu-tips.json        台词库（可按网站定制）
├── waifu.css              样式：气泡框、工具栏
├── live2d.js              Live2D Cubism 2 运行时
└── live2d-static-api.js   静态模型 API（替代原版的 PHP 后端）
```

### 手动引入时的加载顺序

```
live2d.js  →  live2d-static-api.js  →  waifu-tips.js
```

⚠️ **顺序不能错**：`live2d.js` 先定义 `loadlive2d`，`live2d-static-api.js` 才能劫持它。

---

## 工具栏（8 个按钮）

| # | 图标 | 功能 | 开关项 |
|---|---|---|---|
| 1 | `el-icon-house` | 首页 | `canTurnToHomePage` |
| 2 | `el-icon-chat-dot-round` | 一言 | `canSwitchHitokoto` |
| 3 | `el-icon-user` | 换角色 | `canSwitchModel` |
| 4 | `el-icon-magic-stick` | 换皮肤 | `canSwitchTextures` |
| 5 | `el-icon-camera` | 拍照 | `canTakeScreenshot` |
| 6 | `el-icon-view` | 悬停隐藏 | `canHideWaifu` |
| 7 | `el-icon-discover` | 关于 | `canTurnToAboutPage` |
| 8 | `el-icon-switch-button` | 关闭 | `canCloseLive2d` |

不想要的按钮，把对应开关设为 `false`：

```js
live2d_settings['canTakeScreenshot'] = false;   // 不显示「拍照」
```

### 悬停隐藏

点眼睛图标后：鼠标移到模型上 → 模型隐藏（工具栏保留）；移开 → 恢复；再点眼睛退出。

**不写入存储**，刷新即恢复普通状态，避免用户把自己"锁"在隐藏模式里。

---

## 拖拽

```js
live2d_settings['waifuDraggable']     = 'axis-x';    // 水平拖拽 + 吸附边缘（默认）
live2d_settings['waifuDraggable']     = 'unlimited'; // 自由拖拽
live2d_settings['waifuDraggable']     = 'disable';   // 禁用
live2d_settings['waifuDraggableSave'] = true;        // 记住停靠位置
live2d_settings['waifuDraggableSnap'] = 1000;        // 吸附动画时长（毫秒）
```

---

## 存储（可替换）

默认用 `localStorage`。用用户脚本时，可以换成 GM 存储实现**跨网站同步**：

```js
live2d_settings['storage'] = {
    save: function (key, value) { GM_setValue(key, value); },
    load: function (key) { return GM_getValue(key, null); }
};
```

公共电脑场景，什么都不记：

```js
live2d_settings['storage'] = {
    save: function () {},
    load: function () { return null; }
};
```

| 方法 | 约定 |
|---|---|
| `save(key, value)` | `value` 一律为字符串 |
| `load(key)` | 返回字符串；没有则返回 `null` |

---

## 完整配置项

```js
// 后端接口
live2d_settings['modelAPI']      = '//live2d.fghrsh.net/api/';  // 改成你自己的模型仓库
live2d_settings['tipsMessage']   = 'waifu-tips.json';
live2d_settings['hitokotoAPI']   = 'lwl12.com';

// 默认模型
live2d_settings['modelId']            = 1;
live2d_settings['modelTexturesId']    = 0;

// 工具栏开关
live2d_settings['showToolMenu']       = true;
live2d_settings['canCloseLive2d']     = true;
live2d_settings['canSwitchModel']     = true;
live2d_settings['canSwitchTextures']  = true;
live2d_settings['canSwitchHitokoto']  = true;
live2d_settings['canTakeScreenshot']  = true;
live2d_settings['canTurnToHomePage']  = true;
live2d_settings['canTurnToAboutPage'] = true;
live2d_settings['canHideWaifu']       = true;

// 模型切换
live2d_settings['modelStorage']          = true;
live2d_settings['modelRandMode']         = 'switch';  // 'switch' | 'rand'
live2d_settings['modelTexturesRandMode'] = 'rand';

// 样式
live2d_settings['waifuSize']      = '280x250';
live2d_settings['waifuFontSize']  = '14px';
live2d_settings['waifuToolTop']   = '30px';
live2d_settings['waifuMinWidth']  = '768px';    // 窄于此宽度隐藏，'disable' 禁用
live2d_settings['waifuEdgeSide']  = 'right:0';

// 其他
live2d_settings['homePageUrl']   = 'auto';
live2d_settings['aboutPageUrl']  = 'https://github.com/whyyy-404';
```

---

## 自定义台词

编辑 `waifu-tips.json`，按站点元素匹配：

```jsonc
{
  "mouseover": [
    { "selector": ".el-icon-house", "text": ["这里是首页哦"] },
    { "selector": ".my-button",     "text": ["这是个按钮"] }
  ],
  "click": [
    { "selector": ".waifu #live2d", "text": ["不要戳我啦！"] }
  ],
  "seasons": [
    { "date": "01/01", "text": ["元旦快乐~"] }
  ]
}
```

---

## 验证

改完库文件后跑一下，确认没有回归：

```bash
node verify.js
```

覆盖：存储模块、拖拽数学、图标一致性、开关对应、模型切换链路。

---

## 想用自己的模型

模型仓库只要满足这两个条件即可：

1. 根目录有 `models.json`
2. 有 `model/` 目录，按 `model/<模型名>/index.json` 组织

然后改 `live2d_settings['modelAPI']` 指向它。
参考 [live2d-models](https://github.com/whyyy-404/live2d-models) 的 `build-models.js` 生成 `models.json`。

---

## 致谢

看板娘这个生态能走到今天，是很多人在不同方向上一块砖一块砖垒起来的。
这里把站在谁的肩膀上写清楚。

### 上游项目

**核心基础：[fghrsh/live2d_demo](https://github.com/fghrsh/live2d_demo)**（GPL-2.0）
本项目的 `live2d.js`、`waifu-tips.js`、`waifu.css` 都是在它的基础上改的。

- 原作者博客：<https://www.fghrsh.net/post/123.html>
- 前端仓库：<https://github.com/fghrsh/live2d_demo>
- 模型 API：<https://github.com/fghrsh/live2d_api>

**Live2D 官方**
`live2d.js` 内含 **Live2D Cubism 2 SDK**，版权归 **Live2D Inc.** 所有。
<https://www.live2d.com/>

### 参考项目（思路与写法上的借鉴）

设计这套「静态化方案」时，逐一读过下面这些项目。哪些地方借鉴了什么，也一并写出来：

| 项目 | 借鉴了什么 |
|---|---|
| [stevenjoezhang/live2d-widget](https://github.com/stevenjoezhang/live2d-widget) | **静态化不依赖后端的整体思路**；用 `models.json` 统一模型清单；按需加载引擎的分层设计（本版只做 Cubism 2，Cubism 3/5 留给后续） |
| [fghrsh/live2d_api](https://github.com/fghrsh/live2d_api) | 五个接口（`get` / `switch` / `rand` / `rand_textures` / `switch_textures`）的**语义**。本版的静态实现严格对齐它的 PHP 逻辑，包括 `id == 0 ? 2` 这类边界 |
| [guansss/pixi-live2d-display](https://github.com/guansss/pixi-live2d-display) | Cubism 3/5 与 PIXI 的对接方式，第二阶段会用到 |
| [summerscar/live2dDemo](https://github.com/summerscar/live2dDemo) | 多模型切换与加载流程的组织 |
| [jianchengwang/live2d_models](https://github.com/jianchengwang/live2d_models) | 极简模型展示页的形态（演示页的参考对象） |
| [zenghongtu/live2d-model-assets](https://github.com/zenghongtu/live2d-model-assets) | 模型资源的整理与归类方式 |
| [alg-wiki/AzurLaneL2DViewer](https://github.com/alg-wiki/AzurLaneL2DViewer) | `Live2dV3` 的底层实现，moc3 播放的参考 |

### 开源库与 CDN 服务

本项目能一行引入就跑起来，离不开这些免费服务：

| 服务 | 用途 |
|---|---|
| [jsDelivr](https://www.jsdelivr.com/) | 免费 CDN，通过 `@main` 直接从 GitHub 加速分发本仓库与模型仓库 |
| [GitHub](https://github.com/) | 代码托管与 Pages 能力 |
| [jQuery](https://jquery.com/) | 3.3.1，见下方「关于 jQuery」 |
| [Element UI](https://element.eleme.cn/) | 工具栏的 8 个图标（仅引入 icon 字体，不含组件库） |
| [一言 Hitokoto](https://hitokoto.cn/) | 一言接口，使用支持跨域的 `v1.hitokoto.cn` |
| [今日诗词](https://www.jinrishici.com/) | 可选的一言数据源（古诗词） |

### 模型作者

模型素材来自互联网，原始著作权归各模型作者所有，详见
[live2d-models 的说明](https://github.com/whyyy-404/live2d-models#许可与来源)。

### 本版的主要改动

1. **静态化**：去掉 PHP 后端，改用 `models.json` + `live2d-static-api.js` 在前端本地应答
2. **图标**：Flat-UI-Icons → element-ui Icons（8 个按钮）
3. **气泡框**：半透明米黄单行 → 白底圆角 + 小三角箭头 + 多行换行 + 淡入
4. **工具栏**：`top:50px` → `top:30px`，支持停靠左侧镜像
5. **拖拽**：jQuery UI → 原生 Pointer Events（支持触摸、边缘吸附、位置记忆、垂直位置保留、窗口缩放自适应）
6. **新增**：悬停隐藏、存储可替换、消息优先级（重要内容不被悬停台词顶掉）
7. **修复**：`modelStorage=false` 时切换失效、隐私模式白屏、键名冲突、`waifuToolTop` 名实不符、
   换皮肤路径重复拼接导致 404、隐藏模式下台词闪烁、气泡框文字无法选中


本项目以 **GPL-2.0** 分发，详见 [LICENSE](./LICENSE)。
