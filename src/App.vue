<template>
  <router-view :key="$route.fullPath" />
  <div class="background" />
</template>

<script></script>

<style>
body {
  background-color: transparent;
  color: #aaa;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  margin-top: 60px;
}
.background {
  position: fixed;
  z-index: -1;
  inset: 0;
  background: rgb(7, 11, 52);
  background: linear-gradient(135deg, #000318 0%, #15163a 75%, #211f3a 100%);
}
</style>
