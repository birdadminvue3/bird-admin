<script setup lang="ts">
import type { RouteLocationRaw } from "vue-router";
import { useRoute, useRouter } from "vue-router";
import { useTagsViewStore } from "@/store/modules/tags-view";
import { usePermissionStore } from "@/store/modules/permission";
import { useSettingStore } from "@/store/modules/settings";
import { TagsStyle } from "@/enums/index";
import { resolveIcon } from "../lay-sidebar/icon";
import { useMenuTitle } from "@/locales/useMenuTitle";

defineOptions({ name: "LayTag" });

const { t } = useI18n();
const { menuTitle } = useMenuTitle();

const route = useRoute();
const router = useRouter();
const tagsStore = useTagsViewStore();
const permissionStore = usePermissionStore();
const settingStore = useSettingStore();

/** 右键菜单状态 */
const contextMenu = reactive({ visible: false, x: 0, y: 0, path: "" });
/** 滚动容器 */
const scrollbarRef = ref<{ setScrollLeft?: (left: number) => void; wrapRef?: HTMLElement }>();
/** 拖拽起始下标 */
const dragIndex = ref<number | null>(null);

const isSmart = computed(() => settingStore.tagsStyle === TagsStyle.SMART);
const isCard = computed(() => settingStore.tagsStyle === TagsStyle.CARD);
const isChrome = computed(() => settingStore.tagsStyle === TagsStyle.CHROME);

/** 监听路由变化，自动加入页签 */
watch(
  () => route.path,
  () => tagsStore.addView(route, permissionStore.menuRoutes),
  { immediate: true }
);

function isActive(path: string) {
  return route.path === path;
}

function iconOf(icon?: string) {
  return resolveIcon(icon);
}

function handleClick(path: string) {
  if (!isActive(path)) router.push(path as RouteLocationRaw);
}

/**
 * 刷新指定标签页：经 /redirect 中转页跳回原路径，
 * 触发目标视图重新挂载。刷新当前页时保留 query 参数。
 */
function refreshTag(path: string) {
  if (path === route.path) {
    router.replace({ path: "/redirect" + path, query: route.query });
  } else {
    router.replace({ path: "/redirect" + path });
  }
}

/**
 * 关闭指定标签页：固定页签不可关闭。
 * 关闭当前激活页签时，自动跳转到相邻的最后一个剩余页签。
 */
function closeTag(path: string) {
  const removed = tagsStore.closeView(path);
  if (removed.length && isActive(path)) {
    const last = tagsStore.visitedViews[tagsStore.visitedViews.length - 1];
    if (last && last.path !== path) router.push(last.path as RouteLocationRaw);
  }
}

/** 关闭其他标签页（保留固定页签与目标页签） */
function closeOthers(path: string) {
  tagsStore.closeOthers(path);
  if (!isActive(path)) router.push(path as RouteLocationRaw);
}

/** 关闭全部标签页（保留固定页签），跳回固定页签 */
function closeAll() {
  tagsStore.closeAll();
  const affix = tagsStore.affixPath;
  if (affix && !isActive(affix)) router.push(affix as RouteLocationRaw);
}

/** 关闭左侧标签页；仅当当前激活页被关闭时才跳转 */
function closeLeft(path: string) {
  tagsStore.closeLeft(path);
  redirectIfCurrentRemoved();
}

/** 关闭右侧标签页；仅当当前激活页被关闭时才跳转 */
function closeRight(path: string) {
  tagsStore.closeRight(path);
  redirectIfCurrentRemoved();
}

/** 当前路由若已不在剩余页签中，跳到最后一个剩余页签 */
function redirectIfCurrentRemoved() {
  if (!tagsStore.visitedViews.some(v => v.path === route.path)) {
    const last = tagsStore.visitedViews[tagsStore.visitedViews.length - 1];
    if (last) router.push(last.path as RouteLocationRaw);
  }
}

/** 中键点击关闭标签 */
function handleAuxClick(event: MouseEvent, path: string) {
  if (event.button === 1) closeTag(path);
}

/** 滚轮横向滚动：将纵向滚轮映射为横向滚动 */
function handleWheel(event: WheelEvent) {
  const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
  const wrap = scrollbarRef.value?.wrapRef;
  if (wrap) {
    wrap.scrollLeft += delta;
  } else {
    scrollbarRef.value?.setScrollLeft?.((scrollbarRef.value?.wrapRef?.scrollLeft || 0) + delta);
  }
}

function scrollBy(distance: number) {
  const wrap = scrollbarRef.value?.wrapRef;
  if (wrap) wrap.scrollLeft += distance;
}

/** 内容区全屏切换 */
function toggleFullscreen() {
  settingStore.toggleContentFullscreen();
}

/** 右键菜单：根据标签位置计算各项禁用态（参考 vue-pure-admin） */
function menuDisabled(command: string) {
  const list = tagsStore.visitedViews;
  const index = list.findIndex(v => v.path === contextMenu.path);
  const target = list[index];
  if (!target) return false;
  const isFixed = target.affix;
  switch (command) {
    case "refresh":
      // 非当前激活页不提供刷新
      return !isActive(contextMenu.path);
    case "close":
      return isFixed;
    case "others":
      return list.filter(v => !v.affix && v.path !== contextMenu.path).length === 0;
    case "left":
      return index <= 0 || list.slice(0, index).filter(v => !v.affix).length === 0;
    case "right":
      return index === list.length - 1;
    case "all":
      return list.filter(v => !v.affix).length === 0;
    default:
      return false;
  }
}

/** 右键菜单边界钳制，避免超出视口 */
const MENU_WIDTH = 150;
const MENU_HEIGHT = 240;
function openContextMenu(event: MouseEvent, path: string) {
  contextMenu.path = path;
  contextMenu.x = Math.min(event.clientX, window.innerWidth - MENU_WIDTH - 8);
  contextMenu.y = Math.min(event.clientY, window.innerHeight - MENU_HEIGHT - 8);
  contextMenu.visible = true;
}

function closeContextMenu() {
  contextMenu.visible = false;
}

function handleCommand(command: string) {
  if (menuDisabled(command)) return;
  const path = contextMenu.path;
  closeContextMenu();
  switch (command) {
    case "refresh":
      refreshTag(path);
      break;
    case "close":
      closeTag(path);
      break;
    case "others":
      closeOthers(path);
      break;
    case "all":
      closeAll();
      break;
    case "left":
      closeLeft(path);
      break;
    case "right":
      closeRight(path);
      break;
    case "fullscreen":
      toggleFullscreen();
      break;
  }
}

/** 拖拽排序（参考增强） */
function handleDragStart(event: DragEvent, index: number) {
  dragIndex.value = index;
  if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
}

function handleDragOver(event: DragEvent) {
  event.preventDefault();
  if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
}

function handleDrop(index: number) {
  if (dragIndex.value !== null) tagsStore.moveView(dragIndex.value, index);
  dragIndex.value = null;
}

onMounted(() => document.addEventListener("click", closeContextMenu));
onBeforeUnmount(() => document.removeEventListener("click", closeContextMenu));
</script>

<template>
  <div class="lay-tags" :class="`tags-${settingStore.tagsStyle}`">
    <button class="lay-tags-nav" type="button" :title="t('tagsView.scrollLeft')" @click="scrollBy(-240)">
      <el-icon><ArrowLeft /></el-icon>
    </button>

    <el-scrollbar ref="scrollbarRef" class="lay-tags-scroll" wrap-style="overflow-y: hidden" @wheel="handleWheel">
      <div class="lay-tags-list" :class="{ 'no-gap': isChrome }">
        <div
          v-for="(tag, index) in tagsStore.visitedViews"
          :key="tag.path"
          class="lay-tag"
          :class="[
            { active: isActive(tag.path), fixed: tag.affix, dragging: dragIndex === index },
            isSmart && 'tag-smart',
            isCard && 'tag-card',
            isChrome && 'tag-chrome',
          ]"
          draggable="true"
          @click="handleClick(tag.path)"
          @auxclick="handleAuxClick($event, tag.path)"
          @contextmenu.prevent="openContextMenu($event, tag.path)"
          @dragstart="handleDragStart($event, index)"
          @dragover="handleDragOver"
          @drop="handleDrop(index)"
          @dragend="dragIndex = null"
        >
          <el-icon v-if="iconOf(tag.icon)" class="lay-tag-icon"><component :is="iconOf(tag.icon)" /></el-icon>
          <span class="lay-tag-title">{{ menuTitle(tag.title) }}</span>

          <!-- 标签操作：刷新（所有标签）+ 关闭（非固定标签） -->
          <span class="lay-tag-actions">
            <el-icon
              class="lay-tag-action"
              :title="t('tagsView.refreshTip')"
              @click.stop="refreshTag(tag.path)"
            >
              <RefreshRight />
            </el-icon>
            <el-icon
              v-if="!tag.affix"
              class="lay-tag-action"
              :title="t('tagsView.closeTip')"
              @click.stop="closeTag(tag.path)"
            >
              <Close />
            </el-icon>
          </span>
          <!-- 灵动模式底部进度条 -->
          <span v-if="isSmart" class="lay-tag-schedule" />
        </div>
      </div>
    </el-scrollbar>

    <button class="lay-tags-nav" type="button" :title="t('tagsView.scrollRight')" @click="scrollBy(240)">
      <el-icon><ArrowRight /></el-icon>
    </button>
    <button
      class="lay-tags-nav lay-tags-fullscreen"
      type="button"
      :title="t(settingStore.contentFullscreen ? 'tagsView.exitFullscreen' : 'tagsView.fullscreen')"
      @click="toggleFullscreen"
    >
      <el-icon><FullScreen /></el-icon>
    </button>

    <!-- 右键菜单 -->
    <ul
      v-show="contextMenu.visible"
      class="lay-tag-context"
      :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      @click.stop
    >
      <li :class="{ disabled: menuDisabled('refresh') }" @click="handleCommand('refresh')">
        {{ t('tagsView.refresh') }}
      </li>
      <li :class="{ disabled: menuDisabled('close') }" @click="handleCommand('close')">
        {{ t('tagsView.close') }}
      </li>
      <li :class="{ disabled: menuDisabled('left') }" @click="handleCommand('left')">
        {{ t('tagsView.closeLeft') }}
      </li>
      <li :class="{ disabled: menuDisabled('right') }" @click="handleCommand('right')">
        {{ t('tagsView.closeRight') }}
      </li>
      <li :class="{ disabled: menuDisabled('others') }" @click="handleCommand('others')">
        {{ t('tagsView.closeOthers') }}
      </li>
      <li :class="{ disabled: menuDisabled('all') }" @click="handleCommand('all')">
        {{ t('tagsView.closeAll') }}
      </li>
      <li class="divider" />
      <li @click="handleCommand('fullscreen')">
        {{ t(settingStore.contentFullscreen ? 'tagsView.exitFullscreen' : 'tagsView.fullscreen') }}
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.lay-tags {
  height: 40px;
  min-height: 40px;
  display: flex;
  align-items: center;
  background: var(--header-bg);
  border-bottom: 1px solid var(--el-border-color-light);
  padding: 0 6px;
}

.lay-tags-scroll {
  flex: 1;
  min-width: 0;
}

.lay-tags-list {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 40px;
  white-space: nowrap;

  &.no-gap {
    gap: 0;
  }
}

.lay-tags-nav {
  flex: 0 0 auto;
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--el-text-color-regular);
  cursor: pointer;

  &:hover {
    background: var(--el-fill-color-light);
    color: var(--el-color-primary);
  }

  .el-icon {
    font-size: 14px;
  }
}

.lay-tags-fullscreen {
  margin-left: 2px;
}

/* 通用标签项 */
.lay-tag {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
  flex: 0 0 auto;

  .lay-tag-icon {
    font-size: 14px;
  }

  .lay-tag-title {
    flex: 0 0 auto;
  }

  .lay-tag-actions {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    max-width: 0;
    overflow: hidden;
    opacity: 0;
    transition: max-width 0.2s ease, opacity 0.2s ease;
  }

  &:hover .lay-tag-actions,
  &.active .lay-tag-actions {
    max-width: 48px;
    opacity: 1;
  }

  .lay-tag-action {
    font-size: 13px;
    border-radius: 50%;
    flex: 0 0 auto;

    &:hover {
      background: rgba(125, 125, 125, 0.2);
    }
  }

  &.dragging {
    opacity: 0.5;
  }
}

/* ===== 灵动风格（默认） ===== */
.tag-smart {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  background: var(--el-bg-color);
  color: var(--el-text-color-regular);

  &:hover {
    color: var(--el-color-primary);
  }

  &.active {
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-7);
    color: var(--el-color-primary);
  }

  .lay-tag-schedule {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 2px;
    background: var(--el-color-primary);
    transform: scaleX(0);
    transform-origin: center;
    transition: transform 0.3s ease;
  }

  &.active .lay-tag-schedule {
    transform: scaleX(1);
  }

  &:hover .lay-tag-schedule {
    transform: scaleX(0.6);
  }
}

/* ===== 卡片风格 ===== */
.tag-card {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px 6px 0 0;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-regular);

  &:hover {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }

  &.active {
    background: var(--el-color-primary);
    border-color: var(--el-color-primary);
    color: #fff;
  }
}

/* ===== 谷歌（Chrome）风格 ===== */
.tag-chrome {
  height: 32px;
  padding: 0 16px;
  margin-right: -10px;
  border-radius: 8px 8px 0 0;
  background: var(--el-fill-color);
  color: var(--el-text-color-regular);

  &::before,
  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    width: 10px;
    height: 10px;
    background: var(--el-fill-color);
  }

  &::before {
    left: -10px;
    clip-path: polygon(0 100%, 100% 100%, 100% 0);
  }

  &::after {
    right: -10px;
    clip-path: polygon(0 100%, 100% 100%, 0 0);
  }

  &:hover {
    color: var(--el-color-primary);
  }

  &.active {
    z-index: 2;
    background: var(--el-bg-color);
    color: var(--el-color-primary);

    &::before,
    &::after {
      background: var(--el-bg-color);
    }

    &::before {
      clip-path: polygon(0 100%, 100% 100%, 100% 0, 0 0);
    }

    &::after {
      clip-path: polygon(0 100%, 100% 100%, 0 0, 100% 0);
    }
  }
}

/* 右键菜单 */
.lay-tag-context {
  position: fixed;
  z-index: 3000;
  margin: 0;
  padding: 5px 0;
  min-width: 140px;
  list-style: none;
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  box-shadow: var(--el-box-shadow-light);

  li {
    padding: 7px 16px;
    font-size: 12px;
    color: var(--el-text-color-regular);
    cursor: pointer;

    &:hover {
      background: var(--el-fill-color-light);
      color: var(--el-color-primary);
    }

    &.disabled {
      color: var(--el-text-color-disabled);
      cursor: not-allowed;
      pointer-events: none;
    }

    &.divider {
      height: 1px;
      padding: 0;
      margin: 4px 0;
      background: var(--el-border-color-lighter);
      cursor: default;

      &:hover {
        background: var(--el-border-color-lighter);
      }
    }
  }
}
</style>
