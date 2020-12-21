import Vue from 'vue'
import App from './App.vue'
import router from './router'
Vue.config.productionTip = false
// css
import "./assets/css/reset.css";
import './assets/css/global.css'

// api
import api from '../src/config/axios'
Vue.prototype.$api = api;

// ehcarts
let echarts = require('echarts/lib/echarts')
// 引入折线图等组件
require('echarts/lib/chart/line')
require('echarts/lib/chart/bar')
require('echarts/lib/chart/radar')
require('echarts/lib/chart/pie')
// 引入提示框和title组件，图例
require('echarts/lib/component/tooltip')
require('echarts/lib/component/title')
require('echarts/lib/component/legend')
Vue.prototype.$echarts = echarts

// vant
import { Picker, Popup, PullRefresh } from 'vant'
[Picker, Popup, PullRefresh].forEach(component => {
  Vue.use(component)
})

// utils
import utils from './utils'
Vue.prototype.$utils = utils

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
