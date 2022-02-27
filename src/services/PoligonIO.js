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
/**
 * Get aggregates bar of the chosen exchange market with the chosen timespan from the chosen period
 * @param {String} ticker name under with the exchange market is listed
 * @param {String} from The beginning date for the aggregate window. Formated in ISO 8601 (ex. 2022-02-27)
 * @param {String} to The end fate for the aggregate window. Formated in ISO 8601
 * @param {String} timespan The timespan type. Either "minute", "hour", "day", "week", "month", "quarter" or "year".
 * @param {String | Number} timespanMult The timespan multiplier (the number of minutes, hours, days, ...)
 * @returns {Promise<AxiosResponse>}
 */
export const getCryptoAggregate = (ticker, from, to, timespan, timespanMult) => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(from) && /^\d{4}-\d{2}-\d{2}$/.test(to)) {
    const _from = new Date(from)
    const _to = new Date(to)
    if (_from > _to) {
      return Promise.reject(new Error('The chosen "from" date can not be after the chosen "to" date'))
    }
    else if (_from <= new Date(getISODate(-2))) {
      return Promise.reject(new Error('The chosen "from" date can not be from over 2 year ago'))
    }
    else if (_to > new Date(getISODate())) {
      return Promise.reject(new Error('The chosen "to" date can not be in the future'))
    } else {
      return apiClient.get("/v2/aggs/ticker/" + ticker + "/range/" + timespanMult + "/" + timespan + "/" + from + "/" + to)
    }
  } else {
    return Promise.reject(new Error('The chosen date is not in a valid format'))
  }
}

/**
 * Makes ticker symboles returned by the PoligonIO API more readable by humans
 * @param {String} ticker PoligonIO ticker symbols from crypto markets
 */
export const humaniseTicker = ticker =>
  ticker.replace(/\bX:/g, " ")
    .replace(/ETH\b/, " / ETH ")
    .replace(/BTC\b/, " / BTC ")
    .replace(/USD\b/, " / USD ")
    .replace(/EUR\b/, " / EUR ")
    .replace(/GBP\b/, " / GBP ")
    .replace(/CAD\b/, " / CAD ")
    .replace(/AUD\b/, " / AUD ")
    .replace(/JPY\b/, " / JPY ")

/**
 * return an Array of data usable by the Scatter component from the arggregateList using the chosen DataTypes
 */
export const ComputeScatterData = (aggregatesList, xDataType = 'v', yDataType = 'c') => {
  if (!aggregatesList) {
    return {
      error: true,
      message: 'There is not data to show in the chosen period.'
    }
  }
  const validDataTypes = ['c', 'h', 'l', 'o', 't', 'v', 'vw']
  if (validDataTypes.includes(xDataType) && validDataTypes.includes(yDataType)) {
    return aggregatesList.map((aggregate) => {
      const dataPoint = {
        x: aggregate[xDataType],
        y: aggregate[yDataType],
        z: 100 * (aggregate.c - aggregate.o) / aggregate.o,
        time: aggregate.t
      }
      if (aggregate?.T) {
        dataPoint.name = humaniseTicker(aggregate.T)
        dataPoint.t = aggregate.T
      } else {
        dataPoint.name = new Date(aggregate.t).toLocaleString()
      }
      return dataPoint
    })
  } else {
    return {
      error: true,
      message: 'Chosen dataType is not valid.'
    }
  }
}