import Vue from "vue"; //引入Vue
import Router from "vue-router"; //引入vue-router
import Home from "../page/home/index.vue";

Vue.use(Router); //Vue全局使用Router

const routes = [
  //配置路由，这里是个数组
  {
    //每一个链接都是一个对象
    path: "/", //链接路径
    name: "Home", //路由名称，
    component: Home, //对应的组件模板
  },
];

const router = new Router({
  mode: "history",
  routes,
});

export default router;
