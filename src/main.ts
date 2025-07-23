import './assets/main.css'
import './style.css'
import './assets/styles/map-styles.css' // 导入地图样式

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'

const app = createApp(App)

app.use(createPinia())

app.mount('#app')