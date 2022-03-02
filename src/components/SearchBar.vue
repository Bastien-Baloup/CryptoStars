<template>
  <form class="search" aria-label="value searchbar">
    <!-- label -->
    <label :id="id + '-label'" :for="id + '-input'">{{ props.label }}&nbsp;:</label>
    <!-- combobox -->
    <div
      :id="id + 'AutocompletedInput'"
      :ref="id + 'AutocompletedInput'"
      class="autocomplete"
      role="combobox"
      aria-label="value searchbar with autocomplete"
      aria-haspopup="listbox"
      aria-owns="autocomplete-results"
      :aria-expanded="isOpen"
    >
      <!-- input -->
      <input
        :id="id + '-input'"
        v-model="search"
        type="text"
        name="value"
        placeholder="value"
        class="value"
        role="searchbox"
        aria-multiline="false"
        aria-autocomplete="list"
        :aria-controls="id + '-autocomplete-results'"
        :aria-activedescendant="activedescendant"
        :aria-labelledby="id + '-label'"
        autocapitalize="off"
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
        @input="onInput"
        @focus="onFocus"
        @click="onFocus"
        @keydown.down.prevent="onArrowDown"
        @keydown.up.prevent="onArrowUp"
        @keydown.enter.prevent="onEnter"
      />
      <!-- list of suggestions -->
      <ul
        v-show="isOpen"
        :id="id + '-autocomplete-results'"
        class="autocomplete-results"
        role="listbox"
        aria-label="list of autocomplete results"
      >
        <li v-if="isLoading" class="loading">Loading results...</li>
        <li v-else-if="results.length === 0" class="loading">No results Found</li>
        <li
          v-for="(result, i) in results"
          v-else
          :id="getId(i)"
          :key="i"
          class="autocomplete-result"
          :class="{ 'is-active': isSelected(i) }"
          role="option"
          @click="selectValue(result)"
        >{{ result }}</li>
      </ul>
    </div>
    <!-- submit button -->
    <input type="submit" value="Go" class="submit" />
  </form>
</template>
<script setup>
//imports
import { ref } from '@vue/reactivity'
// eslint-disable-next-line no-unused-vars
import { useEventListener } from '@vueuse/core'

//props
const props = defineProps({
  id: { type: String, default: "" },
  isfilterbar: { type: Boolean, default: false },
  label: { type: String, default: 'search' }
})

//reactive state
const isOpen = ref(false)
const results = ref([])
const search = ref("")
const isLoading = ref(false)
// const debounceTimeout = ref(null)
const arrowCounter = ref(0)
const activedescendant = ref("")

// All possible value from witch the suggestions will come
// usualy this gets the list from an API but here because the PoligonIO aPI only allow 5 query/min, we use a static array
const searchResults = props.isfilterbar ?
  [
    "1INCH",
    "AAVE",
    "ACH",
    "ADA",
    "ALBT",
    "ALCX",
    "ALGO",
    "AMP",
    "ANKR",
    "ANT",
    "API3",
    "ATOM",
    "AUCTION",
    "AUD",
    "AVAX",
    "AVT",
    "AXS",
    "BAL",
    "BAND",
    "BAT",
    "BCH",
    "BFT",
    "BNT",
    "BOBA",
    "BOND",
    "BOSON",
    "BSV",
    "BTC",
    "BTG",
    "BTRST",
    "BTSE",
    "CAD",
    "CEL",
    "CGLD",
    "CHSB",
    "CHZ",
    "CLO",
    "CLV",
    "COMP",
    "COTI",
    "CRO",
    "CRV",
    "CTK",
    "CTSI",
    "CVC",
    "DAI",
    "DASH",
    "DAT",
    "DCR",
    "DDX",
    "DGB",
    "DNT",
    "DOGE",
    "DOT",
    "DSH",
    "DUSK",
    "DVF",
    "EDO",
    "EGLD",
    "ENJ",
    "EOS",
    "ESS",
    "ETC",
    "ETH",
    "ETP",
    "EUR",
    "FARM",
    "FCL",
    "FET",
    "FIL",
    "FORTH",
    "FTM",
    "FTT",
    "FUN",
    "GALA",
    "GBP",
    "GNO",
    "GNT",
    "GOT",
    "GRT",
    "GTC",
    "GUSD",
    "HBAR",
    "HMT",
    "ICE",
    "ICP",
    "ICX",
    "IOT",
    "IOTX",
    "IQX",
    "JASMY",
    "JPY",
    "JST",
    "KAVA",
    "KEEP",
    "KNC",
    "KSM",
    "LINK",
    "LOOM",
    "LPT",
    "LRC",
    "LSK",
    "LTC",
    "LUNA",
    "LYM",
    "MANA",
    "MASK",
    "MATIC",
    "MIR",
    "MKR",
    "MLN",
    "MNA",
    "MOB",
    "NANO",
    "NCT",
    "NEAR",
    "NEO",
    "NEXO",
    "NKN",
    "NMR",
    "NU",
    "OCEAN",
    "ODE",
    "OGN",
    "OMG",
    "ORN",
    "OXT",
    "OXY",
    "PAS",
    "PAX",
    "PLA",
    "PLANETS",
    "PNK",
    "POLY",
    "QNT",
    "QRDO",
    "QSH",
    "QTF",
    "QTM",
    "QTUM",
    "QUICK",
    "RAI",
    "RARI",
    "REEF",
    "REN",
    "REP",
    "REQ",
    "RLC",
    "RLY",
    "RNDR",
    "ROSE",
    "SAN",
    "SC",
    "SHIB",
    "SKL",
    "SNT",
    "SNX",
    "SOL",
    "SPELL",
    "SRM",
    "STORJ",
    "STX",
    "SUKU",
    "SUSHI",
    "TLOS",
    "TRAC",
    "TRB",
    "TRIBE",
    "TRU",
    "TRX",
    "TSD",
    "UDC",
    "UMA",
    "UNI",
    "UOS",
    "USD",
    "USDC",
    "USDT",
    "UST",
    "UTK",
    "VEE",
    "VET",
    "VSY",
    "WAVES",
    "WAX",
    "WBTC",
    "WLUNA",
    "XAUT",
    "XDC",
    "XLM",
    "XMR",
    "XRA",
    "XRD",
    "XRP",
    "XSN",
    "XTZ",
    "XVG",
    "XYO",
    "YFI",
    "YGG",
    "ZCN",
    "ZEC",
    "ZEN",
    "ZIL",
    "ZMT",
    "ZRX"
  ] : [
    "1INCHUSD",
    "AAVEUSD",
    "ACHUSD",
    "ADAUSD",
    "ALBTUSD",
    "ALCXUSD",
    "ALGOUSD",
    "AMPUSD",
    "ANKRUSD",
    "ANTUSD",
    "API3USD",
    "ATOMUSD",
    "AUCTIONUSD",
    "AVAXUSD",
    "AVTUSD",
    "AXSUSD",
    "BALUSD",
    "BANDUSD",
    "BATUSD",
    "BCHEUR",
    "BCHGBP",
    "BCHUSD",
    "BFTUSD",
    "BNTUSD",
    "BOBAUSD",
    "BONDUSD",
    "BOSONUSD",
    "BSVUSD",
    "BTCAUD",
    "BTCEUR",
    "BTCGBP",
    "BTCJPY",
    "BTCUSD",
    "BTGUSD",
    "BTRSTUSD",
    "BTSEUSD",
    "CELUSD",
    "CGLDUSD",
    "CHSBUSD",
    "CHZUSD",
    "CLOUSD",
    "CLVUSD",
    "COMPUSD",
    "COTIUSD",
    "CROUSD",
    "CRVUSD",
    "CTKUSD",
    "CTSIUSD",
    "CVCUSD",
    "DAIUSD",
    "DASHUSD",
    "DATUSD",
    "DCRUSD",
    "DDXUSD",
    "DGBUSD",
    "DNTUSD",
    "DOGEUSD",
    "DOTUSD",
    "DSHUSD",
    "DUSKUSD",
    "DVFUSD",
    "EDOUSD",
    "EGLDUSD",
    "ENJUSD",
    "EOSUSD",
    "ESSUSD",
    "ETCUSD",
    "ETHAUD",
    "ETHBTC",
    "ETHUSD",
    "ETPUSD",
    "FARMUSD",
    "FCLUSD",
    "FETUSD",
    "FILUSD",
    "FORTHUSD",
    "FTMUSD",
    "FTTUSD",
    "FUNUSD",
    "GALAUSD",
    "GNOUSD",
    "GNTUSD",
    "GOTUSD",
    "GRTUSD",
    "GTCUSD",
    "GUSDUSD",
    "HBARUSD",
    "HMTUSD",
    "ICEUSD",
    "ICPUSD",
    "ICXUSD",
    "IOTUSD",
    "IOTXUSD",
    "IQXUSD",
    "JASMYUSD",
    "JSTUSD",
    "KAVAUSD",
    "KEEPUSD",
    "KNCUSD",
    "KSMUSD",
    "LINKUSD",
    "LOOMUSD",
    "LPTUSD",
    "LRCUSD",
    "LSKUSD",
    "LTCAUD",
    "LTCBTC",
    "LTCEUR",
    "LTCUSD",
    "LUNAUSD",
    "LYMUSD",
    "MANAUSD",
    "MASKUSD",
    "MATICUSD",
    "MIRUSD",
    "MKRUSD",
    "MLNUSD",
    "MNAUSD",
    "MOBUSD",
    "NANOUSD",
    "NCTUSD",
    "NEARUSD",
    "NEOUSD",
    "NEXOUSD",
    "NKNUSD",
    "NMRUSD",
    "NUUSD",
    "OCEANUSD",
    "ODEUSD",
    "OGNUSD",
    "OMGUSD",
    "ORNUSD",
    "OXTUSD",
    "OXYUSD",
    "PASUSD",
    "PAXUSD",
    "PLANETSUSD",
    "PLAUSD",
    "PNKUSD",
    "POLYUSD",
    "QNTUSD",
    "QRDOUSD",
    "QSHUSD",
    "QTFUSD",
    "QTMUSD",
    "QTUMUSD",
    "QUICKUSD",
    "RAIUSD",
    "RARIUSD",
    "REEFUSD",
    "RENUSD",
    "REPUSD",
    "REQUSD",
    "RLCUSD",
    "RLYUSD",
    "RNDRUSD",
    "ROSEUSD",
    "SANUSD",
    "SCUSD",
    "SHIBUSD",
    "SKLUSD",
    "SNTUSD",
    "SNXUSD",
    "SOLUSD",
    "SPELLUSD",
    "SRMUSD",
    "STORJUSD",
    "STXUSD",
    "SUKUUSD",
    "SUSHIUSD",
    "TLOSUSD",
    "TRACUSD",
    "TRBUSD",
    "TRIBEUSD",
    "TRUUSD",
    "TRXUSD",
    "TSDUSD",
    "UDCUSD",
    "UMAUSD",
    "UNIUSD",
    "UOSUSD",
    "USDCUSD",
    "USDTUSD",
    "USTUSD",
    "UTKUSD",
    "VEEUSD",
    "VETUSD",
    "VSYUSD",
    "WAVESUSD",
    "WAXUSD",
    "WBTCUSD",
    "WLUNAUSD",
    "XAUTUSD",
    "XDCUSD",
    "XLMUSD",
    "XMRUSD",
    "XRAUSD",
    "XRDUSD",
    "XRPAUD",
    "XRPBTC",
    "XRPUSD",
    "XSNUSD",
    "XTZUSD",
    "XVGUSD",
    "XYOUSD",
    "YFIUSD",
    "YGGUSD",
    "ZCNUSD",
    "ZECUSD",
    "ZENUSD",
    "ZILUSD",
    "ZMTUSD",
    "ZRXUSD"
  ]

// expose the search value to be used by the parent
defineExpose({ search })

//methods

//remove the selection then, when the user has stopped typing for 500ms, load the new suggestions
// usefull when searchResults commmes from an API
// const onInput = () => {
//   arrowCounter.value = -1
//   if (search.value.length > 0) {
//     isLoading.value = true
//     // use clearTimeout and setTimeout to update results when the user stop writing
//     clearTimeout(debounceTimeout.value)
//     debounceTimeout.value = setTimeout(() => LoadSuggestions(search.value), 500)
//   } else {
//     clearTimeout(debounceTimeout.value)
//     results.value = []
//     isOpen.value = false
//   }
// }
// because we don't get our values from an API we'll use this instead
const onInput = () => {
  arrowCounter.value = -1
  if (search.value.length > 0) {
    isOpen.value = true
    isLoading.value = true
    LoadSuggestions(search.value)
  } else {
    results.value = []
    isOpen.value = false
  }
}

//open the list
const onFocus = () => {
  if (search.value.length > 0) {
    isOpen.value = true
  }
}

//change the selected suggestions for the one under in the list if there is one
const onArrowDown = () => {
  if (isOpen.value && arrowCounter.value < results.value.length) {
    arrowCounter.value = arrowCounter.value + 1
    setActiveDescendent()
  }
  isOpen.value = true
}

//change the selected suggestions for the one above in the list if there is one
const onArrowUp = () => {
  if (isOpen.value && arrowCounter.value > 0) {
    arrowCounter.value = arrowCounter.value - 1
    setActiveDescendent()
  }
  isOpen.value = true
}

//if the list is open, update the input content with the chosen suggestion if the use did choose one, else submit the form when the list is closed
const onEnter = (e) => {
  if (isOpen.value) {
    search.value = arrowCounter.value >= 0 ? results.value[arrowCounter.value] : search.value
    isOpen.value = false
  } else {
    e.target.parentElement.parentElement.requestSubmit()
  }
}
// update the input content with the chosen suggestion and close the list
const selectValue = chosenValue => {
  search.value = chosenValue
  isOpen.value = false
}

// close the list and reset the selected suggestion
const handleClickOutside = () => {
  isOpen.value = false
  arrowCounter.value = -1
}

// set the activedescendant aria atribute to the id of the active suggestion
const setActiveDescendent = () => {
  activedescendant.value = getId(arrowCounter.value)
}

// get the id attribute of the suggestion
const getId = index => {
  return props.id + `-result-item-${index}`
}

// check if the suggestion is the selected one
const isSelected = index => {
  return index === arrowCounter.value
}

// fetch and update the list of suggestions
const LoadSuggestions = (query) => {
  results.value = searchResults.filter(result => result.includes(query.toUpperCase()))
  isLoading.value = false
}

//close the suggestions list if we click outside of the autocomplete block
useEventListener(
  window,
  'click',
  (event) => {
    if (isOpen.value) {
      const autocomplete = document.getElementById(props.id + "AutocompletedInput")
      if (!event.composedPath().includes(autocomplete)) {
        handleClickOutside()
      }
    }
  },
  {
    passive: true
  }
)

</script>

<style lang="scss" scoped>
.search {
  display: flex;
  align-items: flex-end;
  padding: 1rem;
  label {
    margin-block: auto;
    padding-left: 1rem;
  }
  .value {
    width: 155px;
    height: 25px;
    margin-inline: 1rem;
    background: none;
    color: #aaa;
    border: none;
    border: solid 1px #aaa;
    text-transform: uppercase;
  }

  .autocomplete {
    position: relative;
    width: max-content;
    z-index: 1;
    margin-block: auto;
    .autocomplete-results {
      font-size: 0.75em;
      position: absolute;
      width: 160px;
      text-align: left;
      background-color: #000e;
      border-radius: 0 0 0.1em 0.1em;
      padding-inline: 0;
      padding-block: 0.5rem;
      margin-inline: 1rem;
      margin-block: 0;
      outline: solid 1px #aaa;
      .autocomplete-result {
        padding-inline: 1em;
        list-style: none;
        &.is-active,
        &:hover {
          color: #030303;
          background-color: #d7dadc;
        }
      }
    }
  }

  .submit {
    height: 25px;
    background: none;
    color: #aaa;
    outline: solid 1px #aaa;
    border: none;
    margin-block: auto;
    padding-inline: 0.5rem;
    margin-right: 1rem;
  }
}
</style>