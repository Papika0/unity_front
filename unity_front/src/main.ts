import './assets/main.css'
import './assets/responsive.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createHead } from '@unhead/vue'

import App from './App.vue'
import router from './router'

const app = createApp(App)

const pinia = createPinia()
const head = createHead()

app.use(pinia)
app.use(head)
app.use(router)

app.mount('#app')

// Force scroll to top on initial page load
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual'
}
window.scrollTo(0, 0)
