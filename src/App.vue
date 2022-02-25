<template>
  <header>
    <h1>
      <router-link :to="{ name: 'Home' }">CryptoStars</router-link>
    </h1>
  </header>

  <router-view :key="$route.fullPath" />
  <div class="background" />
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style lang="scss">
@import "normalize.css/normalize.css";
body {
  color: #aaa;
  background: #000;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}
header {
  display: flex;
  border-bottom: solid 1px #aaa;
  h1 {
    margin: 0;
    padding: 1rem;
    border-right: solid 1px #aaa;
  }
}
a {
  color: #aaa;
}
</style>
