import { createRouter, createWebHistory } from "vue-router"

import Home from '../views/Home.vue'
import CryptoPage from '../views/CryptoPage.vue'

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/crypto/:ticker",
    name: "crypto",
    component: CryptoPage,
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
