# o-doctor-releases

O Doctor 的发行仓库：**落地页 + 公开分发包 + 自动更新清单**。

宿主应用源码在 [aispin/x-tools](https://github.com/aispin/x-tools)，
官方插件在 `o-doctor-plugins`。三者职责分开，各自独立发版。

## 结构

```
apps/landing/         落地页（React 19 + Vite 8 + Tailwind 4 + three.js）
  public/downloads/   分发包与签名（构建时产出，不入库）
  public/latest.json  自动更新清单（发布时生成）
```

## 落地页

```bash
pnpm install
pnpm dev        # 本地开发
pnpm build      # 构建
pnpm deploy     # 构建并发布到 gh-pages
```

访问：https://aispin.github.io/o-doctor-releases/

技术要点：
- **Web3D hero**：手写 GLSL 片元着色器（网格涡旋 + 扫描脉冲 + 粒子），
  只用一个全屏平面，不做后处理。`devicePixelRatio` 封顶 2，
  页面不可见时停渲染，`prefers-reduced-motion` 下只画一帧。
- **中英双语 + 明暗双主题**：偏好存 localStorage，首次按浏览器语言判断。
- 遵循 [spec-ui.md](../proj/spec-ui.md)：选择器只认 class、4px 网格、
  按钮三档变体、不引入 antd。

## 自动更新

应用的 `tauri.conf.json` 里 endpoint 指向本仓库的 `latest.json`：

```
https://aispin.github.io/o-doctor-releases/latest.json
```

发布新版本时由 `scripts/release.sh` 生成该文件（含签名），
格式遵循 Tauri updater 规范。

**签名私钥不入库。** 私钥在宿主仓库的 `.secrets/`（已 gitignore），
CI 发布时通过 `TAURI_SIGNING_PRIVATE_KEY` 注入。
