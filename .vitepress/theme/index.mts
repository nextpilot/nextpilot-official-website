import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import ProductLayout from './ProductLayout.vue'
import CatalogLayout from './CatalogLayout.vue'
import SolutionList from './components/SolutionList.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('SolutionList', SolutionList)
    app.component('product', ProductLayout)
    app.component('catalog', CatalogLayout)
  },
}
