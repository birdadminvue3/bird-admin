<script setup lang="ts">
import type { Component } from "vue";
import type { RouteLocationRaw } from "vue-router";
import { useRoute, useRouter } from "vue-router";
import { useResizeObserver } from "@vueuse/core";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  CircleClose,
  Close,
  DArrowLeft,
  DArrowRight,
  Refresh,
  Remove,
} from "@element-plus/icons-vue";
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

/** 当前所有页签 */
const tags = computed(() => tagsStore.visitedViews);
const isSmart = computed(() => settingStore.tagsStyle === TagsStyle.SMART);

/* ===================== 页签操作（右键菜单 + 右侧下拉共用） ===================== */

interface TagAction {
  key: TagCommand;
  labelKey: string;
  icon: Component;
  divided?: boolean;
}

type TagCommand = "refresh" | "close" | "left" | "right" | "others" | "all";

const actions: TagAction[] = [
  { key: "refresh", labelKey: "tagsView.refresh", icon: Refresh },
  { key: "close", labelKey: "tagsView.close", icon: Close },
  { key: "left", labelKey: "tagsView.closeLeft", icon: DArrowLeft, divided: true },
  { key: "right", labelKey: "tagsView.closeRight", icon: DArrowRight },
  { key: "others", labelKey: "tagsView.closeOthers", icon: Remove, divided: true },
  { key: "all", labelKey: "tagsView.closeAll", icon: CircleClose },
];

function isActive(path: string) {
  return route.path === path;
}

function iconOf(icon?: string) {
  return resolveIcon(icon);
}

/** 切换页签：已经是激活页签时不重复导航 */
function handleClick(path: string) {
  if (path !== route.path) router.push(path as RouteLocationRaw);
}

/**
 * 重新加载页签：仅对当前激活页签生效。
 * 经 /redirect 中转页跳回原路径，触发目标视图重新挂载。
 */
function reloadTag(path: string) {
  if (path !== route.path) return;
  router.replace({ path: `/redirect${path}`, query: { ...route.query } });
}

/** 关闭指定页签；关闭当前页签时跳到右侧相邻页签，没有则跳左侧 */
function closeTag(path: string) {
  const index = tags.value.findIndex(view => view.path === path);
  if (index === -1 || tags.value[index].affix) return;
  tagsStore.closeView(path);
  if (path !== route.path) return;
  const next =
    tagsStore.visitedViews[index] ||
    tagsStore.visitedViews[index - 1] ||
    tagsStore.visitedViews[0];
  router.push((next?.path || "/") as RouteLocationRaw);
}

/** 关闭其他页签（保留固定页签与目标页签） */
function closeOthers(path: string) {
  tagsStore.closeOthers(path);
  ensureActive(path);
}

/** 关闭左侧页签（固定页签不受影响） */
function closeLeft(path: string) {
  tagsStore.closeLeft(path);
  ensureActive(path);
}

/** 关闭右侧页签（固定页签不受影响） */
function closeRight(path: string) {
  tagsStore.closeRight(path);
  ensureActive(path);
}

/** 关闭全部页签（保留固定页签） */
function closeAll() {
  tagsStore.closeAll();
  ensureActive(tagsStore.affixPath || tagsStore.visitedViews[0]?.path);
}

/**
 * 当前路由若已被关闭，则跳到指定页签（一般即本次操作的目标页签），
 * 目标不存在时回退到最后一个剩余页签。
 */
function ensureActive(preferred?: string | null) {
  if (tagsStore.visitedViews.some(view => view.path === route.path)) return;
  const target =
    (preferred ? tagsStore.visitedViews.find(view => view.path === preferred) : undefined) ||
    tagsStore.visitedViews[tagsStore.visitedViews.length - 1];
  router.push((target?.path || "/") as RouteLocationRaw);
}

/** 各操作在指定页签上的可用性（参考 vue-pure-admin 的菜单禁用逻辑） */
function isActionDisabled(command: TagCommand, path: string) {
  const list = tags.value;
  const index = list.findIndex(view => view.path === path);
  const target = list[index];
  if (!target) return true;
  switch (command) {
    case "refresh":
      // 只能刷新当前激活页签
      return path !== route.path;
    case "close":
      return target.affix;
    case "left":
      return index <= 0 || !list.slice(0, index).some(view => !view.affix);
    case "right":
      return index === list.length - 1 || !list.slice(index + 1).some(view => !view.affix);
    case "others":
      return !list.some(view => !view.affix && view.path !== path);
    case "all":
      return !list.some(view => !view.affix);
    default:
      return true;
  }
}

function runCommand(command: TagCommand, path: string) {
  if (isActionDisabled(command, path)) return;
  switch (command) {
    case "refresh":
      reloadTag(path);
      break;
    case "close":
      closeTag(path);
      break;
    case "left":
      closeLeft(path);
      break;
    case "right":
      closeRight(path);
      break;
    case "others":
      closeOthers(path);
      break;
    case "all":
      closeAll();
      break;
  }
}

/** 右侧下拉：作用于当前激活页签 */
function onDropdownCommand(command: TagCommand) {
  runCommand(command, route.path);
}

/** 中键关闭页签 */
function handleAuxClick(event: MouseEvent, path: string) {
  if (event.button === 1) {
    event.preventDefault();
    closeTag(path);
  }
}

/* ===================== 右键菜单 ===================== */

const contextMenu = reactive({ visible: false, x: 0, y: 0, path: "" });
const contextMenuRef = ref<HTMLElement>();
const MENU_WIDTH = 168;
const MENU_HEIGHT = 260;

function openContextMenu(event: MouseEvent, path: string) {
  contextMenu.path = path;
  contextMenu.x = Math.max(8, Math.min(event.clientX, window.innerWidth - MENU_WIDTH - 8));
  contextMenu.y = Math.max(8, Math.min(event.clientY, window.innerHeight - MENU_HEIGHT - 8));
  contextMenu.visible = true;
}

function closeContextMenu() {
  contextMenu.visible = false;
}

function handleContextCommand(command: TagCommand) {
  const path = contextMenu.path;
  closeContextMenu();
  runCommand(command, path);
}

/* ===================== 横向滚动 ===================== */

const scrollRef = ref<HTMLElement>();
const tabRef = ref<HTMLElement>();
const translateX = ref(0);
const isOverflow = ref(false);

/** 把位移限制在 [容器宽 - 内容宽, 0] 之间 */
function clampTranslate(value: number) {
  const wrapWidth = scrollRef.value?.clientWidth ?? 0;
  const tabWidth = tabRef.value?.scrollWidth ?? 0;
  if (tabWidth <= wrapWidth) return 0;
  return Math.min(0, Math.max(value, wrapWidth - tabWidth));
}

function updateOverflow() {
  const wrapWidth = scrollRef.value?.clientWidth ?? 0;
  const tabWidth = tabRef.value?.scrollWidth ?? 0;
  isOverflow.value = tabWidth > wrapWidth + 1;
  translateX.value = clampTranslate(translateX.value);
}

/** 保证激活页签处于可视区域（参考 vue-pure-admin 的 moveToView） */
function scrollActiveIntoView() {
  nextTick(() => {
    updateOverflow();
    if (!isOverflow.value) {
      translateX.value = 0;
      return;
    }
    const active = tabRef.value?.querySelector<HTMLElement>(".lay-tag-item.is-active");
    const wrapWidth = scrollRef.value?.clientWidth ?? 0;
    if (!active || !wrapWidth) return;
    const left = active.offsetLeft;
    const right = left + active.offsetWidth;
    const viewLeft = -translateX.value;
    const viewRight = viewLeft + wrapWidth;
    if (left < viewLeft) {
      translateX.value = clampTranslate(-left + 12);
    } else if (right > viewRight) {
      translateX.value = clampTranslate(wrapWidth - right - 12);
    }
  });
}

function scrollBy(distance: number) {
  translateX.value = clampTranslate(translateX.value + distance);
}

/** 滚轮映射为横向滚动 */
function handleWheel(event: WheelEvent) {
  closeContextMenu();
  const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
  translateX.value = clampTranslate(translateX.value - delta);
}

/* ===================== 拖拽排序 ===================== */

const dragIndex = ref<number | null>(null);

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

/* ===================== 生命周期 ===================== */

// 路由变化：加入页签并让激活页签滚动到可视区
watch(
  () => route.path,
  () => {
    tagsStore.addView(route, permissionStore.menuRoutes);
    scrollActiveIntoView();
  },
  { immediate: true }
);

// 页签数量变化：更新溢出状态
watch(
  () => tagsStore.visitedViews.length,
  () => {
    updateOverflow();
    scrollActiveIntoView();
  }
);

useResizeObserver(scrollRef, () => scrollActiveIntoView());

onMounted(() => {
  document.addEventListener("click", closeContextMenu);
  window.addEventListener("resize", closeContextMenu);
  scrollActiveIntoView();
});

onBeforeUnmount(() => {
  document.removeEventListener("click", closeContextMenu);
  window.removeEventListener("resize", closeContextMenu);
});
</script>

<template>
  <div class="lay-tags" :class="`tags-${settingStore.tagsStyle}`">
    <button
      v-show="isOverflow"
      class="lay-tags-arrow"
      type="button"
      :title="t('tagsView.scrollLeft')"
      @click="scrollBy(-200)"
    >
      <el-icon><ArrowLeft /></el-icon>
    </button>

    <div ref="scrollRef" class="lay-tags-scroll" @wheel.prevent="handleWheel">
      <div ref="tabRef" class="lay-tags-tab" :style="{ transform: `translateX(${translateX}px)` }">
        <div
          v-for="(tag, index) in tags"
          :key="tag.path"
          class="lay-tag-item"
          :class="[{ 'is-active': isActive(tag.path), 'is-fixed': tag.affix, dragging: dragIndex === index }]"
          :title="menuTitle(tag.title)"
          draggable="true"
          @click="handleClick(tag.path)"
          @auxclick="handleAuxClick($event, tag.path)"
          @contextmenu.prevent.stop="openContextMenu($event, tag.path)"
          @dragstart="handleDragStart($event, index)"
          @dragover="handleDragOver"
          @drop="handleDrop(index)"
          @dragend="dragIndex = null"
        >
          <el-icon v-if="iconOf(tag.icon)" class="lay-tag-icon">
            <component :is="iconOf(tag.icon)" />
          </el-icon>
          <span class="lay-tag-title">{{ menuTitle(tag.title) }}</span>
          <span
            v-if="!tag.affix"
            class="lay-tag-close"
            :title="t('tagsView.closeTip')"
            @click.stop="closeTag(tag.path)"
          >
            <el-icon><Close /></el-icon>
          </span>
          <span v-if="isSmart" class="lay-tag-schedule" />
        </div>
      </div>
    </div>

    <button
      v-show="isOverflow"
      class="lay-tags-arrow"
      type="button"
      :title="t('tagsView.scrollRight')"
      @click="scrollBy(200)"
    >
      <el-icon><ArrowRight /></el-icon>
    </button>

    <!-- 右侧操作下拉：作用于当前激活页签 -->
    <el-dropdown trigger="click" placement="bottom-end" @command="onDropdownCommand">
      <button class="lay-tags-more" type="button" :title="t('tagsView.actions')">
        <el-icon><ArrowDown /></el-icon>
      </button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            v-for="item in actions"
            :key="item.key"
            :command="item.key"
            :divided="item.divided"
            :disabled="isActionDisabled(item.key, route.path)"
          >
            <el-icon class="lay-tags-more-icon"><component :is="item.icon" /></el-icon>
            {{ t(item.labelKey) }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <!-- 右键菜单 -->
    <transition name="tag-menu">
      <ul
        v-show="contextMenu.visible"
        ref="contextMenuRef"
        class="lay-tag-context"
        :style="{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }"
        @click.stop
      >
        <li
          v-for="item in actions"
          :key="item.key"
          :class="{ disabled: isActionDisabled(item.key, contextMenu.path), divided: item.divided }"
          @click="handleContextCommand(item.key)"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          {{ t(item.labelKey) }}
        </li>
      </ul>
    </transition>
  </div>
</template>

<style scoped lang="scss">
.lay-tags {
  position: relative;
  display: flex;
  align-items: center;
  height: 40px;
  min-height: 40px;
  padding: 0 4px;
  font-size: 13px;
  color: var(--el-text-color-primary);
  background: var(--header-bg);
  border-bottom: 1px solid var(--el-border-color-lighter);
  user-select: none;
}

.lay-tags-scroll {
  flex: 1;
  min-width: 0;
  height: 100%;
  overflow: hidden;
}

.lay-tags-tab {
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;
  transition: transform 0.35s cubic-bezier(0.645, 0.045, 0.355, 1);
  will-change: transform;
}

.lay-tags-arrow,
.lay-tags-more {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border: none;
  border-radius: 4px;
  outline: none;
  background: transparent;
  color: var(--el-text-color-regular);
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;

  &:hover {
    background: var(--el-fill-color-light);
    color: var(--el-color-primary);
  }
}

.lay-tags-more {
  margin-left: 2px;
}

/* ===== 页签项 ===== */
.lay-tag-item {
  position: relative;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 30px;
  margin-right: 2px;
  padding: 0 10px;
  border-radius: 4px;
  color: var(--el-text-color-primary);
  cursor: pointer;
  transition: color 0.2s, background-color 0.2s;

  &.dragging {
    opacity: 0.45;
  }

  &:hover {
    color: var(--el-color-primary);
    background: var(--el-fill-color-light);
  }

  &.is-active {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    font-weight: 500;
  }
}

.lay-tag-icon {
  font-size: 14px;
  opacity: 0.9;
}

.lay-tag-title {
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lay-tag-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-left: 1px;
  border-radius: 50%;
  color: var(--el-text-color-secondary);
  font-size: 11px;
  opacity: 0.4;
  transition: color 0.2s, background-color 0.2s, opacity 0.2s;

  &:hover {
    color: #fff;
    background: var(--el-color-primary);
    opacity: 1;
  }
}

.lay-tag-item:hover .lay-tag-close,
.lay-tag-item.is-active .lay-tag-close {
  opacity: 1;
}

/* 灵动风格：底部进度条 */
.lay-tag-schedule {
  position: absolute;
  right: 8px;
  bottom: 0;
  left: 8px;
  height: 2px;
  border-radius: 2px 2px 0 0;
  background: var(--el-color-primary);
  opacity: 0.55;
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.lay-tag-item.is-active .lay-tag-schedule {
  opacity: 1;
  transform: scaleX(1);
}

.lay-tag-item:hover .lay-tag-schedule {
  transform: scaleX(1);
}

/* ===== 卡片风格 ===== */
.tags-card {
  .lay-tag-item {
    margin: 0 3px;
    border: 1px solid var(--el-border-color-lighter);
    background: var(--el-bg-color);
    color: var(--el-text-color-regular);

    &:hover {
      color: var(--el-color-primary);
      border-color: var(--el-color-primary-light-7);
      background: var(--el-color-primary-light-9);
    }

    &.is-active {
      color: #fff;
      border-color: var(--el-color-primary);
      background: var(--el-color-primary);

      .lay-tag-icon {
        opacity: 1;
      }

      .lay-tag-close {
        color: rgba(255, 255, 255, 0.8);

        &:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.28);
        }
      }
    }
  }
}

/* ===== 谷歌风格 ===== */
.tags-chrome {
  .lay-tags-tab {
    align-items: flex-end;
  }

  .lay-tag-item {
    height: 34px;
    margin-right: -1px;
    border: 1px solid var(--el-border-color-lighter);
    border-bottom: none;
    border-radius: 8px 8px 0 0;
    background: var(--el-fill-color-light);
    color: var(--el-text-color-regular);

    &:hover {
      color: var(--el-color-primary);
      background: var(--el-fill-color);
    }

    &.is-active {
      z-index: 2;
      margin-bottom: -1px;
      border-color: var(--el-border-color-lighter);
      border-bottom: 1px solid var(--el-bg-color-page);
      background: var(--el-bg-color-page);
      color: var(--el-color-primary);
      font-weight: 500;
    }
  }
}

/* ===== 右键菜单 ===== */
.lay-tag-context {
  position: fixed;
  z-index: 3000;
  min-width: 160px;
  margin: 0;
  padding: 5px 0;
  list-style: none;
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  box-shadow: var(--el-box-shadow-light);
  transform-origin: top left;

  li {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 7px 14px;
    font-size: 13px;
    color: var(--el-text-color-primary);
    cursor: pointer;

    &:hover {
      color: var(--el-color-primary);
      background: var(--el-fill-color-light);
    }

    &.divided {
      margin-top: 4px;
      border-top: 1px solid var(--el-border-color-lighter);
    }

    &.disabled {
      color: var(--el-text-color-disabled);
      pointer-events: none;
      cursor: not-allowed;
    }

    .el-icon {
      font-size: 14px;
    }
  }
}

.lay-tags-more-icon {
  margin-right: 6px;
}

/* 右键菜单显隐动画 */
.tag-menu-enter-active,
.tag-menu-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.tag-menu-enter-from,
.tag-menu-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
