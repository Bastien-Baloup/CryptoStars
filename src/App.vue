<template>
  <header>
    <router-link :to="{ name: 'Home' }">
      <img src="/logo.svg" alt class="logo" />
    </router-link>
    <h1>
      <router-link :to="{ name: 'Home' }">CryptoStars</router-link>
    </h1>
    <SearchBar id="search" ref="search" label="Search trade market" @submit.prevent="handleSubmit" />
  </header>

  <router-view :key="$route.fullPath" />
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import SearchBar from './components/SearchBar.vue'

const search = ref(null)
const router = useRouter()

// send user to the page showing the history of the chosen trade market
const handleSubmit = () => {
  router.push({ name: 'crypto', params: { ticker: 'X:' + search.value.search.toUpperCase() } })
}
</script>

<style lang="scss" scoped>
.search {
  border-left: solid 1px #aaa;
}
header {
  display: flex;
  border-bottom: solid 1px #aaa;
  img {
    width: 80px;
    margin-left: 1rem;
  }
  h1 {
    margin: 0;
    margin-right: auto;
    padding: 1rem;
    border-right: solid 1px #aaa;
  }
}
a {
  color: #aaa;
}
</style>
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
</style>
