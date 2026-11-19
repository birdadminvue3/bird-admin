/**
 * 动态菜单标题国际化
 *
 * 后端下发的菜单 title 是中文原文（如「系统管理」），这里以中文原文作为 i18n key：
 * - 命中语言包 `menus.*` 时返回对应译文
 * - 未命中时回退中文原文，避免新版菜单在缺少翻译时出现 `menus.xxx` 之类的原始 key
 *
 * 在模板渲染期间调用 `menuTitle()` 会建立对 locale 的响应式依赖，
 * 因此切换语言后菜单/面包屑/页签标题会即时更新，无需刷新页面。
 */
import { useI18n } from "vue-i18n";

export function useMenuTitle() {
  const { t, te } = useI18n();

  function menuTitle(title?: string | number | null): string {
    if (title === undefined || title === null || title === "") return "";
    const text = String(title);
    const key = `menus.${text}`;
    return te(key) ? String(t(key)) : text;
  }

  return { menuTitle };
}
