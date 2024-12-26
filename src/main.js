import App from '@/App.vue'
import { registerPlugins } from '@core/utils/plugins'
import { createApp } from 'vue'

// Styles
import '@core/scss/template/index.scss'
import '@layouts/styles/index.scss'
import '@styles/styles.scss'

// Create vue app
const app = createApp(App)

// NProgress (loading bar)
import '../node_modules/nprogress/nprogress.css'
// doesn't work in composition API
// and make it globally available
// Ex: this.$nprogress.start(); this.$nprogress.done();
// import NProgress from 'nprogress'
// app.config.globalProperties.nprogress = NProgress;

// Register plugins
registerPlugins(app)

// Mount vue app
app.mount('#app')
