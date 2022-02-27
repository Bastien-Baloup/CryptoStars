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
    <div class="filter">
      <SearchBar
        id="filter"
        ref="filter"
        label="Currency Filter"
        isfilterbar
        @submit.prevent="applyFilter"
      />
    </div>
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
import SearchBar from '../components/SearchBar.vue'


const { getISODate } = useNow()
const date = ref(getISODate())
const data = ref(null)
const filteredData = ref(null)
const error = ref(true)
const errMsg = ref('')
const filter = ref(null)

const scatterData = computed(() => data.value ? ComputeScatterData(filteredData.value ? filteredData.value : data.value.results) : undefined)

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

const applyFilter = () => {
  filteredData.value = data.value.results.filter(value => humaniseTicker(value.T).includes(" " + filter.value.search.toUpperCase() + " "))
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
      border: solid 1px #aaa;
      &::-webkit-calendar-picker-indicator {
        filter: invert(76%) sepia(11%) saturate(0%) hue-rotate(248deg)
          brightness(88%) contrast(92%);
      }
    }
  }
  .filter {
    border-right: solid 1px #aaa;
  }
}
</style>