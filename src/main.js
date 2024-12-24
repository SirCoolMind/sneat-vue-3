import App from '@/App.vue'
import { registerPlugins } from '@core/utils/plugins'
import { createApp } from 'vue'

// Styles
import '@core/scss/template/index.scss'
import '@layouts/styles/index.scss'
import '@styles/styles.scss'

// Create vue app
const app = createApp(App)

// NProgress (loading bar) and make it globally available
import NProgress from 'nprogress'
import '../node_modules/nprogress/nprogress.css'
app.config.globalProperties.$nprogress = NProgress;


// Register plugins
registerPlugins(app)

// Mount vue app
app.mount('#app')
