import { UpdateTickerResponseType } from "../types/updateTickersResponse";

const API_KEY = import.meta.env.VITE_API_KEY;

export const loadTickers = async (tickers: string[]) => {
   const response = await fetch(
      `https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=${tickers.join(
         ",",
      )}&api_key=${API_KEY}`,
   );
   const data: UpdateTickerResponseType = await response.json();
   return data;
};
