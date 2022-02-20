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

</template>

<script setup>
import { ref, onMounted } from "vue"
import { useNow } from "../composables/now"
import { getCryptoGroupedDaily } from "../services/PoligonIO"


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
onMounted(() => fetchData())
</script>