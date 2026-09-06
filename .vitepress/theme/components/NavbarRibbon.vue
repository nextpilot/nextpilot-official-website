<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useData, useRoute } from 'vitepress'
import type { DefaultTheme } from 'vitepress/theme'

interface RibbonItem {
  text: string
  link: string
}
interface RibbonGroup {
  text: string
  items: RibbonItem[]
}

const { theme } = useData()
const route = useRoute()

const panelEl = ref<HTMLElement | null>(null)
const openIndex = ref<number | null>(null)
const panelStyle = ref<Record<string, string>>({})

/** 把导航项收敛为纯字符串链接的条目（过滤函数形式的 link） */
function toRibbonItems(items: DefaultTheme.NavItem[]): RibbonItem[] {
  return items.flatMap((item) =>
    'link' in item && typeof item.link === 'string'
      ? [{ text: item.text, link: item.link }]
      : [],
  )
}

/**
 * 含二级栏目的顶级导航项（VitePress 中顶级项不带 link 时才渲染为 .VPNavBarMenuGroup）。
 * items 即二级栏目列表，栏目首页不在其中（见 config/navbar.mts）。
 */
const groups = computed<RibbonGroup[]>(() =>
  (theme.value.nav ?? []).flatMap((item: DefaultTheme.NavItem) => {
    if (!('items' in item) || !Array.isArray(item.items) || item.items.length === 0) return []
    const items = toRibbonItems(item.items)
    return items.length > 0 ? [{ text: item.text, items }] : []
  }),
)

/** 当前展开的栏目（悬停时才有，非常驻） */
const displayed = computed<RibbonGroup | null>(
  () => (openIndex.value === null ? null : (groups.value[openIndex.value] ?? null)),
)

function isItemActive(link: string): boolean {
  return route.path === link || route.path.startsWith(link)
}

/** 桌面端菜单中 .VPNavBarMenuGroup 的渲染顺序与 groups 一致，按 DOM 下标反查栏目序号 */
function groupIndexFromElement(el: HTMLElement): number | null {
  const groupEl = el.closest('.VPNavBarMenuGroup') as HTMLElement | null
  const menuEl = groupEl?.closest('.VPNavBarMenu') as HTMLElement | null
  if (!groupEl || !menuEl) return null
  const index = Array.from(menuEl.querySelectorAll('.VPNavBarMenuGroup')).indexOf(groupEl)
  return index === -1 ? null : index
}

/** 把面板定位到一级菜单按钮的正下方（左对齐，超出视口右缘时回收），并让箭头对准按钮中心 */
function positionPanel(groupEl: HTMLElement) {
  const rect = groupEl.getBoundingClientRect()
  // 先隐藏再测量宽度，避免在错误位置闪动
  panelStyle.value = { top: `${rect.bottom}px`, left: `${rect.left}px`, visibility: 'hidden' }
  nextTick(() => {
    const width = panelEl.value?.offsetWidth ?? 0
    const left = Math.min(rect.left, Math.max(16, window.innerWidth - width - 16))
    // 箭头相对卡片左缘的偏移 = 按钮中心 - 面板左缘（面板被视口回收时仍对准按钮）
    const arrowX = rect.left + rect.width / 2 - left
    panelStyle.value = {
      top: `${rect.bottom}px`,
      left: `${left}px`,
      '--arrow-x': `${arrowX}px`,
      visibility: 'visible',
    }
  })
}

function closePanel() {
  openIndex.value = null
}

// 鼠标悬停一级栏目时在其正下方展开面板；悬停面板本身时保持；移到导航其它区域时收起
function onMouseOver(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.VPNavBar')) return
  const index = groupIndexFromElement(target)
  if (index !== null && groups.value[index]) {
    if (openIndex.value !== index) {
      openIndex.value = index
      positionPanel(target.closest('.VPNavBarMenuGroup') as HTMLElement)
    }
    return
  }
  if (target.closest('.navbar-ribbon')) return
  closePanel()
}

// 离开整个顶部导航栏时收起
function onMouseOut(event: MouseEvent) {
  const related = event.relatedTarget as HTMLElement | null
  if (!related || !related.closest?.('.VPNavBar')) closePanel()
}

onMounted(() => {
  document.addEventListener('mouseover', onMouseOver)
  document.addEventListener('mouseout', onMouseOut)
  window.addEventListener('scroll', closePanel, { passive: true })
  window.addEventListener('resize', closePanel)
})
onBeforeUnmount(() => {
  document.removeEventListener('mouseover', onMouseOver)
  document.removeEventListener('mouseout', onMouseOut)
  window.removeEventListener('scroll', closePanel)
  window.removeEventListener('resize', closePanel)
})

// 路由切换后收起
watch(() => route.path, closePanel)
</script>

<template>
  <div
    v-if="displayed"
    ref="panelEl"
    class="navbar-ribbon"
    :style="panelStyle"
    :aria-label="`${displayed.text}二级导航`"
  >
    <div class="navbar-ribbon__card">
      <a
        v-for="item in displayed.items"
        :key="item.link"
        class="navbar-ribbon__item"
        :class="{ active: isItemActive(item.link) }"
        :href="item.link"
      >
        {{ item.text }}
      </a>
    </div>
  </div>
</template>
