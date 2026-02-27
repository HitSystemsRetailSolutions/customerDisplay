import { createApp } from 'vue'
import App from './App.vue'
import './index.css'
import { i18n, setupI18n } from './i18n'

async function initApp() {
    await setupI18n()
    createApp(App).use(i18n).mount('#app')
}

initApp()
