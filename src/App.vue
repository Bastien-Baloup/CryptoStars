<template>
  <h1>
    <router-link :to="{ name: 'Home' }">CryptoStars</router-link>
  </h1>
  <router-view :key="$route.fullPath" />
  <div class="background" />
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

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
  background: #000318;
  background: linear-gradient(135deg, #000318 0%, #15163a 75%, #211f3a 100%);
}

a {
  color: #aaa;
}
</style>
