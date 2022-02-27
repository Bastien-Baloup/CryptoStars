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
    <div class="axis">
      <label for="xaxis" class="xaxis-label">X Axis&nbsp;:</label>
      <select id="xaxis" v-model="xDataType" name="xaxis">
        <option value="v">Traded volume</option>
        <option value="t">Time</option>
        <option value="c">Close price</option>
        <option value="h">Highest price</option>
        <option value="l">Lowest price</option>
        <option value="o">Open Price</option>
        <option value="vw">Volume weighted average price</option>
      </select>
      <label for="yaxis">Y Axis&nbsp;:</label>
      <select id="yaxis" v-model="yDataType" name="yaxis">
        <option value="c">Close price</option>
        <option value="h">Highest price</option>
        <option value="l">Lowest price</option>
        <option value="o">Open Price</option>
        <option value="t">Time</option>
        <option value="v">Traded volume</option>
        <option value="vw">Volume weighted average price</option>
      </select>
    </div>
    <div class="filter">
      <SearchBar
        id="filter"
        ref="filterInput"
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
        :xname="dataTypeName(xDataType)"
        :yname="dataTypeName(yDataType)"
        tooltips
        clicktotickerpage
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue"
import { useNow } from "../composables/now"
import { getCryptoGroupedDaily, ComputeScatterData, humaniseTicker, dataTypeName } from "../services/PoligonIO"

import Scatter from '../components/Scatter.vue'
import SearchBar from '../components/SearchBar.vue'

const { getISODate } = useNow()

// reactive state
const date = ref(getISODate())
const data = ref(null)
const filter = ref(null)
const error = ref(true)
const errMsg = ref('')
const filterInput = ref(null)
const xDataType = ref('v')
const yDataType = ref('c')

// computed values
const scatterData = computed(() => data.value ? ComputeScatterData(filter.value ? filteredData.value : data.value.results, xDataType.value, yDataType.value) : undefined)
const filteredData = computed(() => data.value.results.filter(value => humaniseTicker(value.T).includes(" " + filter.value + " ")))
// set the error message whent it comes from the ComputeScatterData function
if (scatterData.value?.error) {
  errMsg.value = scatterData.value.message
}


const Error429Msg = "You've exceeded the maximum requests per minute allowed by the Polygon.io API. Please wait a minute then retry your request."

/**
 * Use the PoligonIO API services to get the data asked by the form.
 * Additionaly handle errors thrown by the PoligonIO API service
 */
const fetchData = async () => {
  const res = await getCryptoGroupedDaily(date.value)
    .catch((err) => {
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
    })
  // update state
  data.value = res.data
  error.value = data.value?.status === 'ERROR' || data.value?.resultsCount === 0
  errMsg.value = res.status === 429 ? Error429Msg : data.value?.error ? data.value.error : scatterData.value.message
}

// update filteredData value when the filter has been changed
const applyFilter = () => {
  filter.value = filterInput.value.search.toUpperCase()
}

console.log()

// initial data fetch
onMounted(() => fetchData())
</script>

<style lang="scss" scoped>
.controls {
  display: flex;
  border-bottom: solid 1px #aaa;
  & > * {
    border-right: solid 1px #aaa;
  }
  input,
  select {
    width: 155px;
    height: 25px;
    margin: 1rem;
    background: none;
    color: #aaa;
  }
  .date {
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
  .xaxis-label {
    margin-left: 1rem;
  }
}
</style>