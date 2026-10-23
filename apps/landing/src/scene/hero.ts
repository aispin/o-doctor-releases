import * as THREE from "three";

/**
 * Hero 背景：一层缓慢呼吸的「诊断网格」+ 流动的能量线。
 *
 * 为什么自己写 shader 而不是用现成库：
 * - 只要一个全屏平面 + 一个 fragment shader，不需要几何体、不需要后处理，
 *   three.js 只负责把画布和 WebGL 上下文管好。bundle 里 three 被单独切 chunk。
 * - 视觉与主题直接对应：网格 = 系统结构，脉冲 = 体检扫描，粒子 = 数据流。
 *
 * 性能约束：
 * - devicePixelRatio 上限 2，否则 5K 屏上片元着色器会拖垮 GPU
 * - 页面不可见时暂停渲染循环（requestAnimationFrame 自然暂停，这里额外在
 *   visibilitychange 时停掉，避免后台耗电）
 * - 尊重 prefers-reduced-motion：只渲染一帧静态画面，不做动画
 */

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;

  varying vec2 vUv;
  uniform float uTime;
  uniform vec2  uRes;
  uniform vec3  uPrimary;
  uniform vec3  uAccent;
  uniform float uDark;
  uniform vec3  uTint;
  uniform float uStrength;
  uniform float uAlphaScale;

  /* 伪随机：给粒子与噪声用 */
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  /* 值噪声，用于网格的微扰 */
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  void main() {
    /* 以画布短边归一化，保证任意宽高比下网格密度一致 */
    vec2 uv = (vUv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
    vec2 p = uv * 2.6;

    float t = uTime * 0.075;

    /* ---- 1) 极坐标扭曲：让网格不是死板的方格 ---- */
    float r = length(p);
    float a = atan(p.y, p.x);
    /* 越靠外越旋转，形成轻微的漩涡感 */
    float twist = r * 0.55 + sin(a * 3.0 + t * 2.0) * 0.14;
    vec2 q = vec2(cos(twist) * p.x - sin(twist) * p.y,
                  sin(twist) * p.x + cos(twist) * p.y);

    /* ---- 2) 网格线 ---- */
    vec2 g = abs(fract(q * 2.2) - 0.5);
    /* 线宽随距离变化：中心细、外围粗，视觉上更像「聚焦」 */
    float lw = 0.012 + r * 0.02;
    float lineX = smoothstep(lw, 0.0, g.x);
    float lineY = smoothstep(lw, 0.0, g.y);
    float grid = max(lineX, lineY);

    /* ---- 3) 扫描脉冲：一圈从中心向外扩散的亮环 ---- */
    float pulseR = mod(uTime * 0.16, 1.6);
    float pulse = smoothstep(0.16, 0.0, abs(r - pulseR));

    /* ---- 4) 粒子：稀疏亮点，模拟数据流 ---- */
    vec2 cell = floor(q * 26.0);
    float h = hash(cell);
    /* 只有少数格子有亮点，且随时间闪 */
    float sparkle = step(0.988, h) * (0.45 + 0.55 * sin(uTime * 2.2 + h * 62.0));
    sparkle *= smoothstep(1.35, 0.15, r);

    /* ---- 5) 噪声扰动，打破规整感 ---- */
    float n = noise(q * 1.6 + t * 2.0);

    /* ---- 合成 ---- */
    vec3 col = vec3(0.0);

    /* 基础网格：越靠外越暗（径向衰减） */
    float falloff = smoothstep(1.5, 0.05, r);
    col += uPrimary * grid * falloff * (0.30 + n * 0.22);

    /* 扫描环：更亮、更窄 */
    col += uAccent * pulse * falloff * 0.9;

    /* 粒子 */
    col += mix(uPrimary, uAccent, h) * sparkle * 1.5;

    /* 中心微光，给标题一点承托 */
    col += uPrimary * smoothstep(0.7, 0.0, r) * 0.10;

    /*
      只输出「光」本身，不输出底色 —— alpha 由亮度决定。
      这样画布在亮色模式下不会糊上一块黑色（底色交给 CSS 的 body）。

      亮色模式下的难点：浅底 + 浅色光 = 什么都看不见。
      解法不是加亮，而是换色 —— 亮色模式用更饱和的深青蓝，让光在白底上有对比；
      暗色模式用亮青，在黑底上发光。两种模式各用一套色，而不是调同一套的透明度。
    */
    /*
      亮色 vs 暗色的差异不在「亮度」，在「用什么颜色画」：
      - 暗色底：用亮青画光，alpha 随亮度走
      - 亮色底：用深青画「墨」，alpha 随亮度走（相当于在白纸上画深色线条）
      所以 uTint 由 JS 侧按主题传入：暗色给亮色，亮色给深色。
    */
    col *= uStrength;
    float lum = clamp(dot(col, vec3(0.299, 0.587, 0.114)), 0.0, 1.0);
    /* 用亮度当 alpha，颜色换成 uTint：白底上得到深色线，黑底上得到亮色光 */
    vec3 outc = mix(uTint, col, uDark);
    gl_FragColor = vec4(outc, clamp(lum * uAlphaScale, 0.0, 1.0));
  }
`;

function hexToVec3(hex: string) {
  const c = new THREE.Color(hex);
  return new THREE.Vector3(c.r, c.g, c.b);
}

export type HeroScene = {
  dispose: () => void;
  /** 主题切换时同步 uniform（暗色下整体更强） */
  setDark: (dark: boolean) => void;
};

export function createHeroScene(canvas: HTMLCanvasElement): HeroScene {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false, // 全屏 shader 不需要 MSAA，省一半带宽
    alpha: true, // 画布透明，底色交给 CSS —— 否则亮色模式下会糊一块黑
    powerPreference: "low-power", // 这是装饰背景，不该抢独显
  });

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr);

  const scene = new THREE.Scene();
  /* 正交相机 + 全屏平面：顶点着色器直接输出裁剪空间坐标，相机参数无所谓 */
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const uniforms = {
    uTime: { value: 0 },
    uRes: { value: new THREE.Vector2(1, 1) },
    uPrimary: { value: hexToVec3("#3b82f6") },
    uAccent: { value: hexToVec3("#22d3ee") },
    uDark: { value: 1 },
    /* 亮色模式下线条的颜色（深青蓝），暗色模式下被 col 覆盖 */
    uTint: { value: hexToVec3("#0369a1") },
    /* 整体强度与 alpha 倍数，按主题切换 */
    uStrength: { value: 1 },
    uAlphaScale: { value: 1.15 },
  };

  const material = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms,
    depthTest: false,
    depthWrite: false,
  });

  const geo = new THREE.PlaneGeometry(2, 2);
  const mesh = new THREE.Mesh(geo, material);
  mesh.frustumCulled = false;
  scene.add(mesh);

  const resize = () => {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    uniforms.uRes.value.set(w * dpr, h * dpr);
  };
  resize();

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let raf = 0;
  let running = true;
  const start = performance.now();

  const tick = () => {
    if (!running) return;
    uniforms.uTime.value = (performance.now() - start) / 1000;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  };

  if (reduced) {
    // 静态一帧，不做动画
    uniforms.uTime.value = 1.6;
    renderer.render(scene, camera);
  } else {
    raf = requestAnimationFrame(tick);
  }

  const onVisibility = () => {
    if (document.hidden) {
      running = false;
      cancelAnimationFrame(raf);
    } else if (!reduced) {
      running = true;
      raf = requestAnimationFrame(tick);
    }
  };
  document.addEventListener("visibilitychange", onVisibility);

  return {
    dispose: () => {
      running = false;
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
      ro.disconnect();
      geo.dispose();
      material.dispose();
      renderer.dispose();
    },
    setDark: (dark: boolean) => {
      uniforms.uDark.value = dark ? 1 : 0;
      // 亮色底：线条要够深、够实；暗色底：光要够亮、够透
      uniforms.uStrength.value = dark ? 1 : 1.5;
      uniforms.uAlphaScale.value = dark ? 1.15 : 1.25;
      if (reduced) renderer.render(scene, camera);
    },
  };
}