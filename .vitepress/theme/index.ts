import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import SolutionList from './components/SolutionList.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('SolutionList', SolutionList)
  },
}
