import { ref, toRefs } from "vue";

export const useNow = () => {
  const nowDate = new Date();
  const now = ref({
    year: nowDate.getFullYear(),
    month: nowDate.getMonth() + 1,
    day: nowDate.getDate(),
    hours: nowDate.getHours(),
    minutes: nowDate.getMinutes(),
    seconds: nowDate.getSeconds(),
  });
  const getNowISODate = () => {
    return (
      now.value.year +
      "-" +
      (now.value.month < 10 ? "0" : "") +
      now.value.month +
      "-" +
      (now.value.day < 10 ? "0" : "") +
      now.value.day
    );
  };
  const updateNow = () => {
    const newNowDate = new Date();
    now.value = {
      year: newNowDate.getFullYear(),
      month: newNowDate.getMonth() + 1,
      day: newNowDate.getDate(),
      hours: newNowDate.getHours(),
      minutes: newNowDate.getMinutes(),
      seconds: newNowDate.getSeconds(),
    };
  };

  return {
    ...toRefs(now.value),
    getNowISODate,
    updateNow,
  };
};
