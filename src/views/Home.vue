<template>
  <div class="controls">
    <div class="date">
    <label id="date-label" for="date">Date&nbsp;:</label>
    <input
      id="date"
      v-model="date"
      type="date"
      name="date"
      :min="getISODate(y = -2)"
      :max="getISODate()"
      pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
      @change="fetchData"
    />
  </div>

  <div v-if="data" class="data">
    <p v-if="error" class="err">{{ errMsg }}</p>
    <div v-else class="results">
      <Scatter
        :data="scatterData"
        xname="volume exchanged"
        yname="last value"
        tooltips
        clicktotickerpage
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue"
import { useNow } from "../composables/now"
import { getCryptoGroupedDaily, ComputeScatterData, humaniseTicker } from "../services/PoligonIO"

import Scatter from '../components/Scatter.vue'

const { getISODate } = useNow()
const date = ref(getISODate())
const data = ref(null)
const error = ref(true)
const errMsg = ref('')

const scatterData = computed(() => data.value ? ComputeScatterData(data.value.results) : undefined)

if (scatterData.value?.error) {
  errMsg.value = scatterData.value.message
}


const Error429Msg = "You've exceeded the maximum requests per minute allowed by the Polygon.io API. Please wait a minute then retry your request."

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
  error.value = data.value?.status === 'ERROR' || data.value?.resultsCount === 0
  errMsg.value = res.status === 429 ? Error429Msg : data.value?.error ? data.value.error : scatterData.value.message

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
        t: aggregate.T,
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

<style lang="scss" scoped>
.controls {
  display: flex;
  border-bottom: solid 1px #aaa;
  input,
  select {
    width: 155px;
    height: 25px;
    margin: 1rem;
    background: none;
    color: #aaa;
  }
  .date {
    border-right: solid 1px #aaa;
  #date-label {
    margin-block: auto;
    padding-left: 1rem;
  }
  #date {
    margin: 1rem;
    background: none;
    border: solid 1px #aaa;
    color: #aaa;
    &::-webkit-calendar-picker-indicator {
      filter: invert(76%) sepia(11%) saturate(0%) hue-rotate(248deg)
        brightness(88%) contrast(92%);
    }
    }
  }
}
</style>