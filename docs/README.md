# docs 目录说明

这个目录是 GitHub Pages 的发布根目录。

## 为什么要单独复制一份 assets

GitHub Pages 只发布一个目录。仓库设置的是 **main 分支 /docs**，
所以页面运行时只能访问 `docs/` 里面的文件，
`../assets/` 在发布范围之外，会 404。

## ⚠️ 改动库之后要同步

`docs/assets/` 里的文件就是 `../assets/` 的副本。
**改了 `../assets/` 里的东西，记得同步过来**，否则演示页跑的还是旧代码：

```powershell
# 在仓库根目录执行
Copy-Item assets\live2d.js, assets\live2d-static-api.js, assets\waifu-tips.js, `
          assets\waifu.css, assets\waifu-tips.json, assets\waifu-tips-blog.json `
          docs\assets\ -Force
```

## 页面引用的地址

演示页对**库本身**用相对路径 `./assets/`（所以能看到仓库当前代码），
对**模型数据**用 CDN（模型太大，不适合复制）。

代码示例里展示给用户看的，则是 `@main` 的 CDN 地址 —— 那是真实的使用方式。
