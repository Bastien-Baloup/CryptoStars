<template>
  <div class="controls">
    <h2 class="ticker">{{ humaniseTicker(props.ticker) }}</h2>
    <div class="dates">
      <label id="from-label" for="from">From&nbsp;:</label>
      <input
        id="from"
        v-model="from"
        type="date"
        name="from"
        :min="getISODate(-2,0,0)"
        :max="to"
        pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
        @change="fetchData"
      />
      <label id="to-label" for="to">To&nbsp;:</label>
      <input
        id="to"
        v-model="to"
        type="date"
        name="to"
        :min="from"
        :max="getISODate(0,0,-1)"
        pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
        @change="fetchData"
      />
    </div>
    <div class="timespan">
      <label for="timaspan">Period&nbsp;:</label>
      <select id="timespan" v-model="selectTimespan" name="timespan" @change="fetchData">
        <option value="1 day">1 day</option>
        <option value="3 day">3 days</option>
        <option value="1 week">1 week</option>
        <option value="1 month">1 month</option>
      </select>
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
  </div>

  <div v-if="data" class="data">
    <p v-if="error" class="err">{{ errMsg }}</p>
    <div v-else class="results">
      <Scatter
        :data="scatterData"
        :xname="dataTypeName(xDataType)"
        :yname="dataTypeName(yDataType)"
        tooltips
        lines
      />
    </div>
  </div>
</template>
<script setup>
import { computed, ref, onMounted } from 'vue'
import { humaniseTicker, getCryptoAggregate, ComputeScatterData, dataTypeName } from '../services/PoligonIO'
import { useNow } from '../composables/now'
import Scatter from '../components/Scatter.vue'

const { getISODate } = useNow()
// props
const props = defineProps({
  ticker: { type: String, default: '' }
})
// reactuve state
const from = ref(getISODate(0,-1,0))
const to = ref(getISODate(0,0,-1))
const selectTimespan = ref("3 day")
const data = ref([])
const error = ref(true)
const errMsg = ref('')
const xDataType = ref('v')
const yDataType = ref('c')
// computed values
const timespan = computed(() => selectTimespan.value ? selectTimespan.value.split(' ') : ['', '']) // array containing the timespan type (day, week or month) and it's multiplier (number of days, weeks or months)
const scatterData = computed(() => data.value ? ComputeScatterData(data.value.results, xDataType.value, yDataType.value) : undefined)

if (scatterData.value?.error) {
  errMsg.value = scatterData.value.message
}

const Error429Msg = "You've exceeded the maximum requests per minute allowed by the Polygon.io API. Please wait a minute then retry your request."

/**
 * Use the PoligonIO API services to get the data asked by the form.
 * Additionaly handle errors thrown by the PoligonIO API service
 */
const fetchData = async () => {
  const res = await getCryptoAggregate(props.ticker, from.value, to.value, timespan.value[1], timespan.value[0])
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
// initial data fetch
onMounted(() => fetchData())
</script>


<style lang="scss" scoped>
.controls {
  display: flex;
  border-bottom: solid 1px #aaa;
  .ticker {
    margin-right: auto;
    margin-block: 0;
    padding: 1rem;
    border-right: solid 1px #aaa;
  }
  .dates {
    border-inline: solid 1px #aaa;
  }
  .axis {
    border-left: solid 1px #aaa;
  }
  label {
    margin-block: auto;
    padding-left: 1rem;
  }
  input,
  select {
    width: 155px;
    height: 25px;
    margin: 1rem;
    background: none;
    color: #aaa;
  }
  input[type="date"] {
    border: solid 1px #aaa;
    &::-webkit-calendar-picker-indicator {
      filter: invert(76%) sepia(11%) saturate(0%) hue-rotate(248deg)
        brightness(88%) contrast(92%);
    }
  }
}
</style>