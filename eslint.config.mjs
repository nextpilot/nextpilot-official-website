import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'
import globals from 'globals'

export default [
  {
    ignores: ['node_modules/**', 'build/**', '.vitepress/cache/**', '.vitepress/dist/**', '.markdownlint-cli2.cjs'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  // .vue 文件用 vue-eslint-parser 解析，内部 script 交给 @typescript-eslint/parser 处理 TS
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
      globals: globals.browser,
    },
  },
  {
    rules: {
      // markdown-it 插件大量使用 any
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      // 布局以 product/catalog 短名注册为 layout key
      'vue/multi-word-component-names': 'off',
    },
  },
]
