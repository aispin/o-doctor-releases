export type Lang = "zh" | "en";

export const dict = {
  zh: {
    "nav.features": "能力",
    "nav.plugins": "插件",
    "nav.download": "下载",

    "hero.badge": "v0.1.0 · macOS",
    "hero.title1": "给电脑",
    "hero.title2": "把把脉",
    "hero.sub":
      "常驻菜单栏的轻量体检工具。磁盘、进程、缓存，一眼看清哪里不对劲。全部在本机运行，不上传任何数据。",
    "hero.cta.primary": "下载 macOS 版",
    "hero.cta.secondary": "查看源码",
    "hero.meta.local": "本地运行",
    "hero.meta.open": "MIT 开源",
    "hero.meta.free": "无付费墙",

    "features.eyebrow": "能力",
    "features.title": "不是又一个清理软件",
    "features.sub":
      "它先告诉你「哪里不对劲」，再让你决定怎么处理。不猜测、不自动动手、不做你不理解的删除。",
    "features.f1.title": "一眼看清",
    "features.f1.desc":
      "四张指标卡：磁盘可用、可释放空间、内存交换、系统负载。绿色表示可以不看，黄红才需要你注意。",
    "features.f2.title": "按位置分组",
    "features.f2.desc":
      "$TMPDIR、/private/tmp、~/.cache、~/Library/Caches 各自成组。位置是判断风险的第一线索。",
    "features.f3.title": "删除前必确认",
    "features.f3.desc":
      "逐条列出要删的路径与体积，二次确认才动手。永久删除，不进废纸篓——所以每一步都要你同意。",
    "features.f4.title": "插件化",
    "features.f4.desc":
      "每个检查是一个独立插件，用 bash 或任意语言写，输出 NDJSON 即可。你也可以写自己的。",
    "features.f5.title": "缓存默认不勾选",
    "features.f5.desc":
      "应用缓存里的东西可能是模型库或运行时，删了要重新下载。这类目录单独成组、默认不选，并写明后果。",
    "features.f6.title": "开源可审",
    "features.f6.desc":
      "MIT 协议，代码全在 GitHub。你装的每个插件都是纯文本，能读到它到底在做什么。",

    "plugins.eyebrow": "官方插件",
    "plugins.title": "开箱就有两个",
    "plugins.sub":
      "官方插件随应用分发，装完即用。第三方插件可以自己写、也能从 GitHub 装。",
    "plugins.p1.name": "系统盘空间守护 · 临时目录诊断",
    "plugins.p1.tag": "temp-analyzer",
    "plugins.p1.desc":
      "扫描四个临时目录，按位置分组列出最占地方的 Top 5。默认勾选的只有系统临时目录，应用缓存要你自己选。",
    "plugins.p2.name": "卡顿杀手 · 浏览器诊断",
    "plugins.p2.tag": "browser-doctor",
    "plugins.p2.desc":
      "找出 agent 遗留的 headless 浏览器进程与临时 profile。进程可以直接结束，profile 目录可以删除。",

    "download.eyebrow": "下载",
    "download.title": "macOS · 约 8 MB",
    "download.note":
      "支持 macOS 12 及以上，Apple Silicon 与 Intel 双架构。首次打开若被 Gatekeeper 拦，右键点图标选「打开」。",
    "download.cta": "下载 .dmg",
    "download.alt": "或从 GitHub Releases 下载",
    "download.copy": "复制",
    "download.copied": "已复制",

    "foot.tagline": "给电脑把把脉",
    "foot.source": "源码",
    "foot.releases": "版本历史",
    "foot.license": "MIT 协议",
    "foot.built": "公开构建",
  },
  en: {
    "nav.features": "Features",
    "nav.plugins": "Plugins",
    "nav.download": "Download",

    "hero.badge": "v0.1.0 · macOS",
    "hero.title1": "Take your Mac's",
    "hero.title2": "pulse",
    "hero.sub":
      "A lightweight checkup that lives in your menu bar. Disk, processes, caches — see what's off at a glance. Everything runs locally; nothing is uploaded.",
    "hero.cta.primary": "Download for macOS",
    "hero.cta.secondary": "View source",
    "hero.meta.local": "Runs locally",
    "hero.meta.open": "MIT licensed",
    "hero.meta.free": "No paywall",

    "features.eyebrow": "Features",
    "features.title": "Not another cleanup app",
    "features.sub":
      "It tells you what's wrong first, then lets you decide. No guessing, no automatic actions, no deletions you don't understand.",
    "features.f1.title": "See it at a glance",
    "features.f1.desc":
      "Four metric cards: free disk, reclaimable space, swap, system load. Green means ignore it; yellow and red mean pay attention.",
    "features.f2.title": "Grouped by location",
    "features.f2.desc":
      "$TMPDIR, /private/tmp, ~/.cache and ~/Library/Caches each get their own group. Location is the first clue to risk.",
    "features.f3.title": "Confirm before delete",
    "features.f3.desc":
      "Every path and size is listed before anything happens. Permanent deletion, no Trash — so every step needs your consent.",
    "features.f4.title": "Plugin-based",
    "features.f4.desc":
      "Each check is an independent plugin. Write it in bash or anything else — emit NDJSON and you're done.",
    "features.f5.title": "Caches stay unchecked",
    "features.f5.desc":
      "App caches may hold model files or runtimes. Those groups start unchecked, labelled, and explain the cost.",
    "features.f6.title": "Open source",
    "features.f6.desc":
      "MIT licensed, all code on GitHub. Every plugin is plain text you can read before running it.",

    "plugins.eyebrow": "Official plugins",
    "plugins.title": "Two included",
    "plugins.sub":
      "Official plugins ship with the app. Third-party ones you can write yourself or install from GitHub.",
    "plugins.p1.name": "Disk Guardian · Temp Directory",
    "plugins.p1.tag": "temp-analyzer",
    "plugins.p1.desc":
      "Scans four temp locations and lists the top 5 space hogs per group. Only system temp dirs are checked by default; app caches are opt-in.",
    "plugins.p2.name": "Lag Killer · Browser",
    "plugins.p2.tag": "browser-doctor",
    "plugins.p2.desc":
      "Finds orphaned headless browser processes and leftover profiles. Processes can be terminated, profiles deleted.",

    "download.eyebrow": "Download",
    "download.title": "macOS · about 8 MB",
    "download.note":
      "Requires macOS 12 or later, universal for Apple Silicon and Intel. If Gatekeeper blocks the first launch, right-click the icon and choose Open.",
    "download.cta": "Download .dmg",
    "download.alt": "or get it from GitHub Releases",
    "download.copy": "Copy",
    "download.copied": "Copied",

    "foot.tagline": "Take your Mac's pulse",
    "foot.source": "Source",
    "foot.releases": "Release history",
    "foot.license": "MIT license",
    "foot.built": "Built in public",
  },
} as const;

export type DictKey = keyof (typeof dict)["zh"];