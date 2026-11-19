/**
 * 主题应用工具：把 Pinia 中的设置同步到 document。
 * - 明亮/暗黑：切换 html 上的 .dark class（Element Plus 官方暗黑方案）
 * - 主题色：派生 --el-color-primary 的 light-3/5/7/8/9 与 dark-2
 * - 菜单布局：写到 body[data-layout]，由 SCSS 控制侧边栏宽度与显隐
 * - 侧边栏配色：写到 html[data-sidebar-color]
 */
import { ThemeMode, LayoutMode, SidebarColor } from "@/enums/index";

/** hex -> rgb */
function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace("#", "");
  const full = value.length === 3
    ? value.split("").map(c => c + c).join("")
    : value;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

/** rgb -> hex */
function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, "0")).join("");
}

/** 按比例混合颜色：ratio=1 完全返回 target */
function mix(from: number[], to: number[], ratio: number): string {
  return rgbToHex(
    from[0] + (to[0] - from[0]) * ratio,
    from[1] + (to[1] - from[1]) * ratio,
    from[2] + (to[2] - from[2]) * ratio
  );
}

const WHITE = [255, 255, 255];
const BLACK = [0, 0, 0];

/** 应用 Element Plus 主题色及其渐变梯度 */
export function applyThemeColor(color: string) {
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color)) return;
  const root = document.documentElement;
  const rgb = hexToRgb(color);
  root.style.setProperty("--el-color-primary", color);
  const lightSteps: Array<[number, number]> = [
    [3, 0.7],
    [5, 0.5],
    [7, 0.3],
    [8, 0.2],
    [9, 0.1],
  ];
  lightSteps.forEach(([step, ratio]) => {
    root.style.setProperty(`--el-color-primary-light-${step}`, mix(rgb, WHITE, ratio));
  });
  root.style.setProperty("--el-color-primary-dark-2", mix(rgb, BLACK, 0.2));
}

/** Element Plus 暗黑变量依赖 html.dark，这里统一判断是否应处于暗色 */
function resolveIsDark(theme: ThemeMode): boolean {
  if (theme === ThemeMode.DARK) return true;
  if (theme === ThemeMode.AUTO) return window.matchMedia("(prefers-color-scheme: dark)").matches;
  return false;
}

/** 应用明亮/暗黑主题 */
export function applyThemeMode(theme: ThemeMode) {
  const root = document.documentElement;
  root.classList.toggle("dark", resolveIsDark(theme));
  root.setAttribute("data-theme-mode", theme);
}

/** View Transitions API 的最小类型描述（避免依赖 lib.dom 的版本差异） */
type ViewTransitionLike = { ready: Promise<void> };
type DocumentWithViewTransition = Document & {
  startViewTransition?: (update: () => void) => ViewTransitionLike;
};

/**
 * 带圆形扩散特效的明暗主题切换（参考 cool-admin）。
 *
 * 以 trigger 元素中心为原点，用 `clip-path: circle()` 对 View Transition 的
 * 新旧快照做扩散/收缩动画：切到暗色时旧快照收缩，切到亮色时新快照扩散。
 *
 * @param theme   目标主题
 * @param trigger 触发点击的 DOM 元素（作为扩散圆心，缺省时取视口中心）
 * @param update  真正提交状态变更的回调（同步更新 Pinia store）
 */
export function switchThemeMode(
  theme: ThemeMode,
  trigger: Element | null | undefined,
  update: () => void
): void {
  const doc = document as DocumentWithViewTransition;
  const isDark = resolveIsDark(theme);

  // 降级：浏览器不支持、或用户开启了「减少动画」时，直接同步切换
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (typeof doc.startViewTransition !== "function" || reduceMotion) {
    applyThemeMode(theme);
    update();
    return;
  }

  const rect = trigger?.getBoundingClientRect();
  const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
  const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
  // 覆盖整个视口所需的最大半径
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );

  const transition = doc.startViewTransition(() => {
    // 必须在快照回调内同步落到 DOM：先改 class，再提交 store
    applyThemeMode(theme);
    update();
  });

  transition.ready
    .then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];
      document.documentElement.animate(
        { clipPath: isDark ? [...clipPath].reverse() : clipPath },
        {
          duration: 420,
          easing: "ease-in-out",
          pseudoElement: isDark
            ? "::view-transition-old(root)"
            : "::view-transition-new(root)",
        }
      );
    })
    .catch(() => {
      /* 连续点击导致动画被替换时忽略 */
    });
}

/** 应用菜单布局（body[data-layout] 驱动样式） */
export function applyLayoutMode(layout: LayoutMode) {
  document.body.setAttribute("data-layout", layout);
}

/** 应用侧边栏配色 */
export function applySidebarColor(scheme: SidebarColor) {
  document.documentElement.setAttribute("data-sidebar-color", scheme);
}

/** 监听系统主题变化（仅 theme=AUTO 时生效） */
export function watchSystemTheme(callback: () => void): () => void {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const handler = () => callback();
  media.addEventListener("change", handler);
  return () => media.removeEventListener("change", handler);
}

/** 一次性应用全部外观设置 */
export function applyAllSettings(options: {
  theme: ThemeMode;
  themeColor: string;
  layout: LayoutMode;
  sidebarColorScheme: SidebarColor;
}) {
  applyThemeMode(options.theme);
  applyThemeColor(options.themeColor);
  applyLayoutMode(options.layout);
  applySidebarColor(options.sidebarColorScheme);
}
