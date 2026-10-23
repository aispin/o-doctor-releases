import { useEffect, useRef, useState } from "react";
import {
  MonitorSmartphone,
  FolderTree,
  ShieldCheck,
  Puzzle,
  Lock,
  GitBranch,
  Check,
  ArrowUpRight,
  Apple,
  Copy,
  Sun,
  Moon,
  Languages,
} from "lucide-react";
import { dict, type Lang, type DictKey } from "./lib/i18n";
import { createHeroScene, type HeroScene } from "./scene/hero";

const REPO = "https://github.com/aispin/x-tools";
const RELEASES = "https://github.com/aispin/o-doctor-releases/releases";
const DMG = "/o-doctor-releases/downloads/O-Doctor.dmg";
const INSTALL_CMD = "brew install --cask aispin/tap/o-doctor";

function useRevealOnScroll() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll("[data-reveal]"));
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.setAttribute("data-shown", "true"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.setAttribute("data-shown", "true");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "-10% 0px -10% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<HeroScene | null>(null);

  // 语言与主题都从 localStorage 恢复，首次默认「中文 + 暗色」
  // 优先级：用户手动选过的 > 浏览器语言 > 默认中文
  // （产品面向中文用户，英文作为可切换项，不假设访客一定是英文环境）
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem("odoctor.lang");
    if (saved === "zh" || saved === "en") return saved;
    const nav = navigator.language.toLowerCase();
    if (nav.startsWith("zh")) return "zh";
    if (nav.startsWith("en")) return "en";
    return "zh";
  });
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("odoctor.theme");
    if (saved === "dark") return true;
    if (saved === "light") return false;
    return true; // 落地页默认暗色，视觉上更有冲击力
  });
  const [topbarSolid, setTopbarSolid] = useState(false);
  const [copied, setCopied] = useState(false);

  const t = (k: DictKey) => dict[lang][k];

  // 主题 class
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("odoctor.theme", dark ? "dark" : "light");
    sceneRef.current?.setDark(dark);
  }, [dark]);

  // 语言
  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    localStorage.setItem("odoctor.lang", lang);
  }, [lang]);

  // WebGL 场景
  useEffect(() => {
    if (!canvasRef.current) return;
    const scene = createHeroScene(canvasRef.current);
    sceneRef.current = scene;
    scene.setDark(dark);
    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
    // 只初始化一次，主题变化走 setDark
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 滚动时给顶栏加背板
  useEffect(() => {
    const onScroll = () => setTopbarSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useRevealOnScroll();

  const copyCmd = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_CMD);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* 剪贴板被拒时静默失败，用户还能手动选中 */
    }
  };

  return (
    <>
      <header className="topbar" data-solid={topbarSolid ? "true" : "false"}>
        <div className="shell" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a className="brand" href="#top" style={{ textDecoration: "none", color: "inherit" }}>
            <span className="brand-mark">O</span>
            <span>O Doctor</span>
          </a>
          <nav className="nav-links">
            <a className="nav-link" href="#features">
              {t("nav.features")}
            </a>
            <a className="nav-link" href="#plugins">
              {t("nav.plugins")}
            </a>
            <a className="nav-link" href="#download">
              {t("nav.download")}
            </a>
          </nav>
          <span style={{ flex: 1 }} />
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setLang(lang === "zh" ? "en" : "zh")}
            title={lang === "zh" ? "Switch to English" : "切换到中文"}
            aria-label="Switch language"
          >
            <Languages className="btn-ic" />
            {lang === "zh" ? "EN" : "中文"}
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setDark(!dark)}
            title={dark ? "切换亮色" : "切换暗色"}
            aria-label="Toggle theme"
          >
            {dark ? <Sun className="btn-ic" /> : <Moon className="btn-ic" />}
          </button>
        </div>
      </header>

      <main id="top">
        {/* ---------------- Hero ---------------- */}
        <section className="hero">
          <canvas ref={canvasRef} className="hero-canvas" aria-hidden="true" />
          <div className="hero-veil" aria-hidden="true" />
          <div className="shell hero-inner">
            <span className="hero-eyebrow">
              <span className="dot-live" />
              {t("hero.badge")}
            </span>
            <h1 className="hero-title">
              {t("hero.title1")}
              <br />
              <span className="grad">{t("hero.title2")}</span>
            </h1>
            <p className="hero-sub">{t("hero.sub")}</p>
            <div className="hero-actions">
              <a className="btn btn-primary" href="#download">
                <Apple className="btn-ic" />
                {t("hero.cta.primary")}
              </a>
              <a
                className="btn btn-outline"
                href={REPO}
                target="_blank"
                rel="noreferrer noopener"
              >
                <GitBranch className="btn-ic" />
                {t("hero.cta.secondary")}
              </a>
            </div>
            <div className="hero-meta">
              <span className="hm-item">
                <Check className="hm-ic" />
                {t("hero.meta.local")}
              </span>
              <span className="hm-item">
                <Check className="hm-ic" />
                {t("hero.meta.open")}
              </span>
              <span className="hm-item">
                <Check className="hm-ic" />
                {t("hero.meta.free")}
              </span>
            </div>
          </div>
        </section>

        {/* ---------------- 能力 ---------------- */}
        <section className="section" id="features">
          <div className="shell">
            <div className="section-head reveal" data-reveal>
              <span className="section-eyebrow">{t("features.eyebrow")}</span>
              <h2 className="section-title">{t("features.title")}</h2>
              <p className="section-sub">{t("features.sub")}</p>
            </div>

            <div className="feature-grid">
              {[
                { Ic: MonitorSmartphone, k: "f1" },
                { Ic: FolderTree, k: "f2" },
                { Ic: ShieldCheck, k: "f3" },
                { Ic: Puzzle, k: "f4" },
                { Ic: Lock, k: "f5" },
                { Ic: GitBranch, k: "f6" },
              ].map(({ Ic, k }, i) => (
                <article
                  className="feature-card reveal"
                  data-reveal
                  key={k}
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  <span className="feature-icon">
                    <Ic className="fi-ic" />
                  </span>
                  <h3 className="feature-title">
                    {t(`features.${k}.title` as DictKey)}
                  </h3>
                  <p className="feature-desc">{t(`features.${k}.desc` as DictKey)}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- 插件 ---------------- */}
        <section className="section" id="plugins">
          <div className="shell">
            <div className="section-head reveal" data-reveal>
              <span className="section-eyebrow">{t("plugins.eyebrow")}</span>
              <h2 className="section-title">{t("plugins.title")}</h2>
              <p className="section-sub">{t("plugins.sub")}</p>
            </div>

            <div className="reveal" data-reveal style={{ marginTop: 40 }}>
              <div className="plugin-row">
                <span className="plugin-name">{t("plugins.p1.name")}</span>
                <span className="plugin-tag">{t("plugins.p1.tag")}</span>
                <span className="plugin-desc">{t("plugins.p1.desc")}</span>
              </div>
              <div className="plugin-row">
                <span className="plugin-name">{t("plugins.p2.name")}</span>
                <span className="plugin-tag">{t("plugins.p2.tag")}</span>
                <span className="plugin-desc">{t("plugins.p2.desc")}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- 下载 ---------------- */}
        <section className="section" id="download">
          <div className="shell">
            <div className="section-head reveal" data-reveal>
              <span className="section-eyebrow">{t("download.eyebrow")}</span>
              <h2 className="section-title">{t("download.title")}</h2>
            </div>

            <div className="download-card reveal" data-reveal style={{ marginTop: 28 }}>
              <div className="download-main">
                <h3 className="download-title">O Doctor for macOS</h3>
                <p className="download-note">{t("download.note")}</p>
                <div className="download-cmd">
                  <span className="cmd-text">
                    <span className="cmd-prompt">$ </span>
                    {INSTALL_CMD}
                  </span>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => void copyCmd()}
                  >
                    {copied ? <Check className="btn-ic" /> : <Copy className="btn-ic" />}
                    {copied ? t("download.copied") : t("download.copy")}
                  </button>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <a className="btn btn-primary" href={DMG} download>
                  <Apple className="btn-ic" />
                  {t("download.cta")}
                </a>
                <a
                  className="btn btn-outline"
                  href={RELEASES}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {t("download.alt")}
                  <ArrowUpRight className="btn-ic" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-foot">
        <div className="shell foot-row">
          <span className="brand" style={{ gap: 8 }}>
            <span className="brand-mark" style={{ width: 22, height: 22, fontSize: 11 }}>
              O
            </span>
            <span style={{ color: "var(--foreground)", fontWeight: 600 }}>O Doctor</span>
          </span>
          <span>{t("foot.tagline")}</span>
          <span style={{ opacity: 0.6 }}>·</span>
          <span>{t("foot.built")}</span>
          <div className="foot-links">
            <a className="foot-link" href={REPO} target="_blank" rel="noreferrer noopener">
              {t("foot.source")}
            </a>
            <a className="foot-link" href={RELEASES} target="_blank" rel="noreferrer noopener">
              {t("foot.releases")}
            </a>
            <span className="foot-link" style={{ cursor: "default" }}>
              {t("foot.license")}
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}