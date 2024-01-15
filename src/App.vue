<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
import { getBrowserLang } from "./utils/index";
export default {
  name: "App",
  components: {},
  mounted() {
    console.log(" this.getBrowserLang();", getBrowserLang());
    this.$i18n.locale = getBrowserLang();
  },
  methods: {},
};
</script>

<style>
#app {
  color: rgba(0, 0, 0, 0.87);
}
</style>
