import Vue from "vue";
import Antd from "ant-design-vue";
import router from "./router/index";
import i18n from "./locales/index";
import App from "./App.vue";
import "ant-design-vue/dist/antd.css";

Vue.config.productionTip = false;

Vue.use(Antd);

new Vue({
  router,
  i18n,
  render: (h) => h(App),
}).$mount("#app");
