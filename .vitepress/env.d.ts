/// <reference types="vitepress/client" />

// `createContentLoader` 数据文件的 `data` 导出由 VitePress 在构建期注入，
// 这里声明以通过 vue-tsc 类型检查。
declare module '*.data.mts' {
  export const data: any
}
