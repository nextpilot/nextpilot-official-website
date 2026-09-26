<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useData } from 'vitepress'

const { lang } = useData()
const isZh = computed(() => (lang.value || 'zh-CN').startsWith('zh'))

const homeLink = computed(() => (isZh.value ? '/' : '/en/'))
const docsLink = computed(() => (isZh.value ? '/docs/manual/' : '/en/docs/manual/'))

const countdown = ref(10)
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer!)
      window.location.href = homeLink.value
    }
  }, 1000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <main class="not-found" role="main">
    <div class="container">
      <h1 class="code">404</h1>
      <p class="title">{{ isZh ? '页面未找到' : 'Page Not Found' }}</p>
      <p class="desc">
        {{ isZh ? '抱歉，您访问的页面不存在。可能已被移除、更名或暂时不可用。' : 'Sorry, the page you are looking for does not exist. It may have been removed, renamed, or is temporarily unavailable.' }}
      </p>
      <div class="actions">
        <a class="btn btn-primary" :href="homeLink">
          {{ isZh ? '返回首页' : 'Go to Homepage' }}
        </a>
        <a class="btn btn-outline" :href="docsLink">
          {{ isZh ? '查看文档' : 'View Docs' }}
        </a>
      </div>
      <p class="tip">
        {{ isZh ? `${countdown}s 后自动跳转首页` : `Redirecting to homepage in ${countdown}s...` }}
      </p>
    </div>
  </main>
</template>

<style scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 80px 24px;
  text-align: center;
}

.container {
  max-width: 520px;
}

.code {
  font-size: 120px;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-brand-1);
  margin: 0;
  opacity: 0.3;
}

.title {
  font-size: 28px;
  font-weight: 700;
  margin: 8px 0 12px;
  color: var(--vp-c-text-1);
}

.desc {
  font-size: 15px;
  color: var(--vp-c-text-2);
  margin-bottom: 32px;
  line-height: 1.7;
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 28px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;
  white-space: nowrap;
}

.btn-primary {
  color: #fff;
  background-color: var(--vp-c-brand-1);
  border: 2px solid var(--vp-c-brand-1);
}

.btn-primary:hover {
  background-color: var(--vp-c-brand-2);
  border-color: var(--vp-c-brand-2);
  color: #fff;
  text-decoration: none;
}

.btn-outline {
  color: var(--vp-c-brand-1);
  background-color: transparent;
  border: 2px solid var(--vp-c-brand-1);
}

.btn-outline:hover {
  color: var(--vp-c-brand-2);
  border-color: var(--vp-c-brand-2);
  text-decoration: none;
}

.tip {
  font-size: 13px;
  color: var(--vp-c-text-3);
  margin: 0;
}
</style>
