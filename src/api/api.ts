import { TickerType } from "../types/ticker.type";
import { UpdateTickerResponseType } from "../types/updateTickersResponse";

interface ICallback {
   (value: number): void;
}

const tickersHandlers = new Map<string, ICallback[]>();

const API_KEY = import.meta.env.VITE_API_KEY;

const loadTickers = async () => {
   if (tickersHandlers.size === 0) return;
   const response = await fetch(
      `https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=${[
         ...tickersHandlers.keys(),
      ].join(",")}&api_key=${API_KEY}`,
   );
   const data: UpdateTickerResponseType = await response.json();
   const tempArr = Object.entries(data).map(([key, value]) => [key, 1 / value]);
   const updatedPrices = Object.fromEntries(tempArr);

   Object.keys(updatedPrices).forEach(currency => {
      const handlers = tickersHandlers.get(currency) || [];
      handlers.forEach(cb => cb(updatedPrices[currency]));
   });
};

export const subscribeToTicker = (ticker: string, cb: ICallback) => {
   const subscribers = tickersHandlers.get(ticker) || [];
   tickersHandlers.set(ticker, [...subscribers, cb]);
};

export const unsubscribeFromTicker = (ticker: string) => {
   tickersHandlers.delete(ticker);
};

setInterval(loadTickers, 3000);
