<template>
  <div class="container">Header</div>
</template>

<script>
export default {
  name: "HEADER",
  data() {
    return {};
  },
};
</script>

<style scoped lang="css">
.container {
  position: fixed;
  top: 0;
  display: flex;
  width: 100%;
  align-items: center;
  height: 60px;
  background-color: #fff;
  border-bottom: 1px solid #eeecec;
  box-shadow: 0px 4px 4px 0px rgba(221, 221, 221, 0.25);
  padding: 0 20px;
  z-index: 100;
}

@media screen and (max-width: 640px) {
  .container {
    height: 50px;
  }
}
</style>
