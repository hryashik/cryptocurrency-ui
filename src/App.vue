<script lang="ts">
import { TickerType } from "./types/ticker.type";
export default {
   data() {
      return {
         ticker: "",
         tickers: [] as TickerType[],
         sel: null as null | TickerType,
         graph: [] as number[],
      };
   },
   methods: {
      addTicker() {
         if (this.ticker.length) {
            const currentTicker = {
               name: this.ticker,
               price: "-",
            };
            const apiKey = import.meta.env.VITE_API_KEY;
            setInterval(async () => {
               const f = await fetch(
                  `https://min-api.cryptocompare.com/data/price?fsym=${currentTicker.name}&tsyms=USD&api_key=${apiKey}`,
               );
               const data = await f.json();
               const findTicker = this.tickers.find(
                  (t) => t.name === currentTicker.name,
               )!;
               const price =
                  data.USD > 1 ? data.USD.toFixed(2) : data.USD.toPrecision(2);
               findTicker.price = price;

               if (this.sel?.name === currentTicker.name) {
                  this.graph.push(data.USD);
               }
            }, 3000);
            this.ticker = "";
            this.tickers.push(currentTicker);
         }
      },
      handlerDelete(tickerToRemove: TickerType) {
         this.tickers = this.tickers.filter((t) => t !== tickerToRemove);
         if (this.sel === tickerToRemove) this.sel = null;
      },
      normalizeGraph() {
         const maxValue = Math.max(...this.graph);
         const minValue = Math.min(...this.graph);
         return this.graph.map(price => 5 + ((price - minValue) * 95 / (maxValue - minValue)))
      },
      select(t: TickerType) {
         this.sel = t;
         this.graph = [];
      }
   },
};
</script>

<template>
   <div class="px-8 py-4">
      <!-- TICKER INPUT -->
      <div class="w-82 mb-6">
         <form @submit.prevent="addTicker" class="flex flex-col items-start">
            <label for="ticker-input">Тикер</label>
            <input
               v-model="ticker"
               id="ticker-input"
               type="text"
               placeholder="Например DOGE"
               class="mb-4 mt-3 w-64 rounded-md border-b-2 border-indigo-300 border-opacity-0 px-2 shadow-xl focus:border-b-2 focus:border-opacity-100 focus:outline-none"
            />
            <input
               type="submit"
               value="+  Добавить"
               class="rounded-full bg-gray-500 px-4 py-2 text-white hover:cursor-pointer active:bg-gray-600"
            />
         </form>
      </div>
      <!-- BODY -->
      <template v-if="tickers.length">
         <hr class="bg-rose-600" />
         <!-- COINS -->
         <div class="mb-4 mt-4 grid grid-cols-1 gap-2 sm:grid-cols-5">
            <div
               v-for="(t, idx) in tickers"
               :key="idx"
               @click="select(t)"
               :class="{ 'border-4': t === sel }"
               class="flex flex-col items-center rounded-md border-purple-800 p-4 hover:cursor-pointer"
            >
               <p class="text-gray-400">{{ t.name }} - USD</p>
               <h3 class="mb-4 mt-2 text-xl">{{ t.price }}</h3>
               <button
                  @click.stop="() => handlerDelete(t)"
                  class="flex justify-center rounded-lg px-4 py-2 transition-colors hover:bg-gray-200"
               >
                  <img src="assets/delete-icon.png" class="w-5" alt="" />
                  <p>Удалить</p>
               </button>
            </div>
         </div>
         <!-- GRAPHIC -->
         <template v-if="sel">
            <hr />
            <div>
               <section class="relative">
                  <h3 class="my-8 text-lg font-medium leading-6 text-gray-900">
                     {{ sel.name }}
                  </h3>
                  <div
                     class="flex h-64 items-end border-b border-l border-gray-600"
                  >
                     <div
                        v-for="(bar, idx) in normalizeGraph()"
                        :style="{height: `${bar}%`}"
                        :key="idx"
                        class="w-10 border bg-purple-800"
                     ></div>
                  </div>
                  <button
                     @click="sel = null"
                     type="button"
                     class="absolute right-0 top-0"
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
