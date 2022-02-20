<template>
  <h1>StarStocks</h1>
  <label for="date">Date&nbsp;:</label>
  <input
    id="date"
    v-model="date"
    type="date"
    name="date"
    :max="getNowISODate()"
  />

</template>

<script setup>
import { useNow } from "../composables/now"

const { getNowISODate } = useNow()

</script>