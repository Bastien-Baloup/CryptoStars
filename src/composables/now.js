import { ref, toRefs } from "vue"

export const useNow = () => {
  const nowDate = new Date()
  const now = ref({
    year: nowDate.getFullYear(),
    month: nowDate.getMonth() + 1,
    day: nowDate.getDate(),
    hours: nowDate.getHours(),
    minutes: nowDate.getMinutes(),
    seconds: nowDate.getSeconds(),
  })
  const getISODate = (y = 0, m = 0, d = 0) => {
    const year = now.value.year + y
    const month = now.value.month + m
    const day = now.value.day + d
    return (
      year +
      "-" +
      (month < 10 ? "0" : "") + month +
      "-" +
      (day < 10 ? "0" : "") + day
    )
  }
  const updateNow = () => {
    const newNowDate = new Date()
    now.value = {
      year: newNowDate.getFullYear(),
      month: newNowDate.getMonth() + 1,
      day: newNowDate.getDate(),
      hours: newNowDate.getHours(),
      minutes: newNowDate.getMinutes(),
      seconds: newNowDate.getSeconds(),
    }
  }

  return {
    ...toRefs(now.value),
    getISODate,
    updateNow,
  }
}
