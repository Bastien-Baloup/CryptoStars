<template>
  <h1>StarStocks</h1>
  <label for="date">Date&nbsp;:</label>
  <input
    id="date"
    v-model="date"
    type="date"
    name="date"
    :max="getNowISODate()"
    @change="fetchData"
  />

  <div v-if="data" class="data">
    <p v-if="error" class="err">{{ errMsg }}</p>
    <div v-else class="results">
      <Scatter
        :data="ComputeScatterData(data.results)"
        xname="volume exchanged"
        yname="last value"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useNow } from "../composables/now"
import { getCryptoGroupedDaily } from "../services/PoligonIO"

import Scatter from '../components/Scatter.vue'

const { getNowISODate } = useNow()
let date = ref(getNowISODate())
let data = ref(null)
let error = ref(false)
let errMsg = ref('')

/**
 * Use the PoligonIO API services to get the data asked by the form.
 * Additionaly handle errors thrown by the PoligonIO API service
 */
const fetchData = async () => {
  const res = await getCryptoGroupedDaily(date.value).catch((err) => {
    console.log(err.message)
    if (err.response?.data?.status === 'ERROR') {
      return err.response
    } else {
      return {
        data: {
          status: 'ERROR',
          error: err.message
        }
      }
    }

  }
  )
  data.value = res.data
  error.value = data.value?.status === 'ERROR'
  errMsg.value = data.value?.error

  // console.log(data.value)
}

/**
 * @typedef {{c: Number, h: Number, l: Number, n: Number, o: Number, t: Number, v: Number, vw:Number}} Aggregate
 */
/**
 * Sort aggregates by the biggest exchaged volume without side effects.
 * @param {Array<Aggregate>} list List of aggregate bars from the PoligonIO API.
 * @returns {Array<Aggregate>} A copy of the input list sorted by exhanged volumes.
 */
const sortedAggregateByVolumeDesc = (list) => {
  return [...list].sort((a, b) => b.v - a.v)
}

/**
 * Makes ticker symboles returned by the PoligonIO API more readable by humans
 * @param {String} ticker PoligonIO ticker symbols from crypto markets
 */
const humaniseTicker = ticker =>
  ticker.replace(/\bX:/g, "")
    .replace(/BTC\b/, " / BTC")
    .replace(/ETH\b/, " / ETH")
    .replace(/USD\b/, " / USD")
    .replace(/EUR\b/, " / EUR")
    .replace(/GBP\b/, " / GBP")
    .replace(/CAD\b/, " / CAD")
    .replace(/AUD\b/, " / AUD")
    .replace(/JPY\b/, " / JPY")

const ComputeScatterData = (aggregatesList, xDataType = 'v', yDataType = 'c') => {
  const validDataTypes = ['c', 'h', 'l', 'o', 't', 'v', 'vw']
  if (validDataTypes.includes(xDataType) && validDataTypes.includes(yDataType)) {
    const sortedList = sortedAggregateByVolumeDesc(aggregatesList)
    return sortedList.map((aggregate) => {
      return {
        name: humaniseTicker(aggregate.T),
        x: aggregate[xDataType],
        y: aggregate[yDataType],
        z: 100 * (aggregate.c - aggregate.o) / aggregate.o
      }
    })
  } else {
    error.value = true
    errMsg.value = 'Chosen dataType is not valid.'
    return []
  }
}

onMounted(() => fetchData())
</script>