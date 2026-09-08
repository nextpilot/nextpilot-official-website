import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import ProductLayout from './ProductLayout.vue'
import CatalogLayout from './CatalogLayout.vue'
import SolutionLayout from './SolutionLayout.vue'
import BlogLayout from './BlogLayout.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('solution', SolutionLayout)
    app.component('product', ProductLayout)
    app.component('catalog', CatalogLayout)
    app.component('blog', BlogLayout)
  },
}
