import axios from "axios"
import { useNow } from '../composables/now'

const { getISODate } = useNow()
// Axios client for the Polygone.io REST API
// using the Authorization header for authentification
const apiClient = axios.create({
  baseURL: "https://api.polygon.io/",
  withCredentials: false,
  headers: {
    Accept: "application/json",
    Authorization: "Bearer " + import.meta.env.VITE_API_KEY,
    "Content-Type": "application/json",
  },
})

/**
 * Get the daily open, high, low, and close (OHLC) for the entire cryptocurrency markets.
 * @param {String} date The beginning date for the aggregate window. Formated in ISO 8601 (ex. 2022-02-19)
 * @returns {Promise<AxiosResponse>} 
 */
export const getCryptoGroupedDaily = (date) => {
  // test if the string is a date formated in ISO 8601
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const _date = new Date(date)
    if (_date <= new Date(getISODate(-2))) {
      return Promise.reject(new Error('The chosen date can not be from over 2 year ago'))
    } else if (_date > new Date(getISODate())) {
      return Promise.reject(new Error('The chosen date can not be in the future'))
    } else {
      return apiClient.get("/v2/aggs/grouped/locale/global/market/crypto/" + date)
    }
  } else {
    return Promise.reject(new Error('The chosen date is not in a valid format'))
  }
}
