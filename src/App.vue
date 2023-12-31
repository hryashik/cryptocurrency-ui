<script lang="ts">
import { FetchCoinApiResponse } from "./types/fetchCoinResponse.type";
import { TickerType } from "./types/ticker.type";
import {
   subscribeToTicker,
   unsubscribeFromTicker,
   addTickerMutation,
   removeTickerMutation,
} from "./api/api";

export default {
   data() {
      return {
         ticker: "",
         tickers: [] as TickerType[],
         selectedTicker: null as null | TickerType,
         graph: [] as number[],
         coins: undefined as undefined | FetchCoinApiResponse["Data"],
         validateErr: false,
         filter: "",
         page: 1,
      };
   },
   computed: {
      findCompleteTickers() {
         if (!this.coins) return;
         const arr: string[] = [];
         for (let key in this.coins) {
            if (arr.length === 4) break;
            const fullName = this.coins[key].FullName.toLowerCase();
            if (
               fullName.includes(this.ticker.toLowerCase()) &&
               this.validateTicker(key)
            ) {
               arr.push(key);
            }
         }
         return arr;
      },
      startIndex() {
         return (this.page - 1) * 5;
      },
      endIndex() {
         return this.page * 5;
      },
      hasNextPage() {
         return this.filteredTickers.length > this.endIndex;
      },
      filteredTickers() {
         const filteredTickers = this.tickers.filter(t =>
            t.name.toLowerCase().includes(this.filter.toLowerCase()),
         );
         return filteredTickers;
      },
      paginatedTickers() {
         return this.filteredTickers.slice(this.startIndex, this.endIndex);
      },
      normalizedGraph() {
         const maxValue = Math.max(...this.graph);
         const minValue = Math.min(...this.graph);
         if (maxValue === minValue) {
            return this.graph.map(() => 50);
         }
         return this.graph.map(
            price => 5 + ((price - minValue) * 95) / (maxValue - minValue),
         );
      },
      pageStateOptions() {
         return {
            filter: this.filter,
            page: this.page,
         };
      },
   },
   watch: {
      tickers() {
         localStorage.setItem(
            "cryptonomicon-list",
            JSON.stringify(this.tickers),
         );
      },
      selectedTicker() {
         this.graph = [];
      },
      paginatedTickers() {
         if (this.paginatedTickers.length === 0 && this.page > 1) {
            this.page -= 1;
         }
      },
      filter() {
         this.page = 1;
      },
      pageStateOptions(value) {
         window.history.pushState(
            "",
            document.title,
            `${window.location.pathname}?filter=${value.filter}&page=${value.page}`,
         );
      },
   },
   async beforeMount() {
      const response = await this.fetchCoins();
      this.coins = response.Data;
   },
   created() {
      const windowData = Object.fromEntries(
         new URL(window.location.href).searchParams.entries(),
      );

      const VALID_KEYS = ["page", "filter"];

      VALID_KEYS.forEach(key => {
         if (windowData[key]) {
            //@ts-ignore
            this[key] = windowData[key];
         }
      });

      const data = localStorage.getItem("cryptonomicon-list");
      if (data) {
         const tickersFromStorage: TickerType[] = JSON.parse(data);
         this.tickers = tickersFromStorage;
         this.tickers.forEach(t =>
            subscribeToTicker(t.name, value =>
               this.updateTicker(t.name, value),
            ),
         );
      }

      // API HOOKS
      addTickerMutation(this.addTicker);
      removeTickerMutation(tickerName => {
         this.tickers = this.tickers.filter(t => t.name !== tickerName);
      });
   },
   methods: {
      formatPrice(price: number | string) {
         if (!price) return "-";
         if (typeof price === "string") return price;
         return price > 1 ? price.toFixed(2) : price.toPrecision(2);
      },
      updateTicker(tickerName: string, price: number) {
         const findTicker = this.tickers.find(t => t.name === tickerName)!;
         findTicker.price = price;
         if (findTicker === this.selectedTicker) {
            this.graph.push(price);
         }
      },
      addTicker(tickerName: string) {
         if (tickerName) {
            if (!this.validateTicker(tickerName)) {
               this.validateErr = true;
               return;
            }
            const currentTicker = {
               name: tickerName.toUpperCase(),
               price: "-",
            };

            this.tickers = [...this.tickers, currentTicker];
            subscribeToTicker(currentTicker.name, price =>
               this.updateTicker(currentTicker.name, price),
            );

            this.ticker = "";
            this.filter = "";
         }
      },
      handlerDelete(tickerToRemove: TickerType) {
         this.tickers = this.tickers.filter(t => t !== tickerToRemove);
         if (this.selectedTicker === tickerToRemove) this.selectedTicker = null;
         unsubscribeFromTicker(tickerToRemove.name);
      },
      select(t: TickerType) {
         this.selectedTicker = t;
      },
      async fetchCoins() {
         const f = await fetch(
            "https://min-api.cryptocompare.com/data/all/coinlist?summary=true",
         );
         const coins: FetchCoinApiResponse = await f.json();
         return coins;
      },
      validateTicker(tickerName: string) {
         let validate = true;
         for (let t of this.tickers) {
            if (
               this.ticker &&
               t.name.toLowerCase().includes(tickerName.toLowerCase())
            ) {
               validate = false;
            }
         }
         return validate;
      },
      validateBG(tickerName: string) {
         if (this.coins) {
            if (this.coins[tickerName]) {
               return true;
            } else {
               return false;
            }
         }
      },
   },
};
</script>
<template>
   <div class="px-8 py-4">
      <!-- TICKER INPUT -->
      <div class="w-82 mb-6">
         <form
            class="flex flex-col items-start"
            @submit.prevent="addTicker(ticker)"
         >
            <label for="ticker-input">Тикер</label>
            <div class="w-64">
               <input
                  id="ticker-input"
                  v-model="ticker"
                  type="text"
                  placeholder="Например DOGE"
                  class="mb-2 mt-3 w-full rounded-md border-[1px] px-2 py-2 shadow-xl focus:border-2 focus:border-black focus:border-opacity-100 focus:outline-none"
                  @input="validateErr = false"
               />
               <div
                  v-if="ticker.length"
                  class="grid grid-cols-4 justify-items-center gap-1"
               >
                  <div
                     v-for="h of findCompleteTickers"
                     :key="h"
                     class="flex w-full justify-center rounded-full bg-gray-400 px-1 py-1 text-sm text-white hover:cursor-pointer"
                     @click="addTicker(h)"
                  >
                     <p class="overflow-hidden">
                        {{ h }}
                     </p>
                  </div>
               </div>
            </div>

            <p v-if="validateErr" class="text-rose-500">
               Такой тикер уже добавлен
            </p>
            <input
               type="submit"
               value="+  Добавить"
               class="mt-2 rounded-full bg-gray-500 px-4 py-2 text-white hover:cursor-pointer active:bg-gray-600"
            />
         </form>
      </div>
      <!-- BODY -->
      <template v-if="tickers.length">
         <div class="mb-4">
            <input
               v-model="filter"
               class="rounded-md border-2 px-2 py-1 shadow-md"
               type="text"
               placeholder="Фильтр"
            />
            <div class="mt-3 flex items-center">
               <button
                  v-if="page > 1"
                  class="rounded-full bg-gray-400 px-3 py-1 text-white transition-colors hover:bg-gray-500"
                  @click="page = page - 1"
               >
                  Назад
               </button>
               <span
                  class="ml-2 mr-2 rounded-full border-2 border-gray-400 px-2 text-center"
                  >{{ page }}</span
               >
               <button
                  v-if="hasNextPage"
                  class="rounded-full bg-gray-400 px-3 py-1 text-white transition-colors hover:bg-gray-500"
                  @click="page = page + 1"
               >
                  Вперед
               </button>
            </div>
         </div>
         <hr class="border-t border-gray-700" />
         <!-- COINS -->
         <div class="mb-4 mt-4 grid grid-cols-1 gap-2 sm:grid-cols-5">
            <div
               v-for="(t, idx) in paginatedTickers"
               :key="idx"
               :class="{
                  'border-4': t === selectedTicker,
                  'bg-rose-400': !coins?.hasOwnProperty(t.name),
               }"
               class="flex flex-col items-center rounded-md border-purple-800 p-4 hover:cursor-pointer"
               @click="select(t)"
            >
               <p class="text-gray-400">{{ t.name }} - USD</p>
               <h3 class="mb-4 mt-2 text-xl">{{ formatPrice(t.price) }}</h3>
               <button
                  class="flex justify-center rounded-lg px-4 py-2 transition-colors hover:bg-gray-200"
                  @click.stop="() => handlerDelete(t)"
               >
                  <img src="assets/delete-icon.png" class="w-5" alt="" />
                  <p>Удалить</p>
               </button>
            </div>
         </div>
         <!-- GRAPHIC -->
         <template v-if="selectedTicker">
            <hr class="border-t border-gray-700" />
            <div>
               <section class="relative">
                  <h3 class="my-8 text-lg font-medium leading-6 text-gray-900">
                     {{ selectedTicker.name }}
                  </h3>
                  <div
                     class="flex h-64 items-end border-b border-l border-gray-600"
                  >
                     <div
                        v-for="(bar, idx) in normalizedGraph"
                        :key="idx"
                        :style="{ height: `${bar}%` }"
                        class="w-10 border bg-purple-800"
                     ></div>
                  </div>
                  <button
                     type="button"
                     class="absolute right-0 top-0"
                     @click="selectedTicker = null"
                  >
                     <svg
                        xmlns="http://www.w3.org/2000/svg"
                        xmlns:xlink="http://www.w3.org/1999/xlink"
                        xmlns:svgjs="http://svgjs.com/svgjs"
                        version="1.1"
                        width="30"
                        height="30"
                        x="0"
                        y="0"
                        viewBox="0 0 511.76 511.76"
                        style="enable-background: new 0 0 512 512"
                        xml:space="preserve"
                     >
                        <g>
                           <path
                              d="M436.896,74.869c-99.84-99.819-262.208-99.819-362.048,0c-99.797,99.819-99.797,262.229,0,362.048    c49.92,49.899,115.477,74.837,181.035,74.837s131.093-24.939,181.013-74.837C536.715,337.099,536.715,174.688,436.896,74.869z     M361.461,331.317c8.341,8.341,8.341,21.824,0,30.165c-4.16,4.16-9.621,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    l-75.413-75.435l-75.392,75.413c-4.181,4.16-9.643,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    c-8.341-8.341-8.341-21.845,0-30.165l75.392-75.413l-75.413-75.413c-8.341-8.341-8.341-21.845,0-30.165    c8.32-8.341,21.824-8.341,30.165,0l75.413,75.413l75.413-75.413c8.341-8.341,21.824-8.341,30.165,0    c8.341,8.32,8.341,21.824,0,30.165l-75.413,75.413L361.461,331.317z"
                              fill="#718096"
                              data-original="#000000"
                           ></path>
                        </g>
                     </svg>
                  </button>
               </section>
            </div>
         </template>
      </template>
   </div>
</template>

<style scoped>
.active-coin {
   border: 3px solid rgb(95, 43, 226);
}
</style>
