/**
 * 把后端下发的图标标识解析为 Element Plus 全局组件名。
 * 例如 "ep:home-filled" -> "HomeFilled"（图标已在 plugins/elementPlusIcons.ts 全局注册）。
 */
export function resolveIcon(icon?: string): string | undefined {
  if (!icon) return undefined;
  const raw = icon.replace(/^ep:/, "").trim();
  // 其他图标集（如 i-svg:xxx）暂不处理，交给调用方回退
  if (!raw || raw.includes(":")) return undefined;
  return raw
    .split("-")
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}
