// markdownlint 配置：针对 VitePress 中文文档站，关闭与 frontmatter / Vue 组件 / 手写表格冲突的样式规则
module.exports = {
  globs: ['source/**/*.md', 'README.md'],
  config: {
    default: true,
    MD013: false, // line-length：中文长行常见
    MD022: false, // blanks-around-headings：内容里紧凑标题
    MD024: false, // no-duplicate-heading：多栏目同名词常见
    MD025: false, // single-h1：frontmatter.title + 正文 h1 会被误判
    MD026: false, // no-trailing-punctuation：中文标题结尾标点
    MD033: false, // no-inline-html：正文里的 Vue 组件标签
    MD036: false, // no-emphasis-as-heading：正文用加粗当小标题
    MD040: false, // fenced-code-language：历史内容有未标注语言的代码块
    MD041: false, // first-line-heading：页面首行是 frontmatter
    MD045: false, // no-alt-text：历史截图缺 alt，暂不强制
    MD051: false, // link-fragments：中文标题 slug 与 VitePress 不一致，会误报
    MD060: false, // table-column-style：手写表格对齐方式不统一
  },
}
