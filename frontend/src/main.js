import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './assets/style.css'
import { initBookData } from '@/mock/book'
import { initBorrowData } from '@/mock/borrow-data'
import './assets/global.css'
import AdminAside from '@/components/AdminAside.vue'
import AdminTop from '@/components/AdminTop.vue'
import AIAssistant from '@/components/AIAssistant.vue'
// 初始化数据
initBookData()
initBorrowData()

Vue.use(ElementUI)
Vue.config.productionTip = false
Vue.prototype.$message = ElementUI.Message
Vue.prototype.$confirm = ElementUI.MessageBox.confirm
Vue.component('AdminAside', AdminAside);
Vue.component('AdminTop', AdminTop);
Vue.component('AIAssistant', AIAssistant)
// 创建全局事件总线
const eventBus = new Vue()
window.eventBus = eventBus

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')