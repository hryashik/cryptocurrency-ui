import { UpdateTickerResponseType } from "../types/updateTickersResponse";
import { WSDataMessageType } from "../types/websocketDataMessage";

const AGGREGATE_INDEX = "5";

interface ICallback {
   (value: number): void;
}

const tickersHandlers = new Map<string, ICallback[]>();

const API_KEY = import.meta.env.VITE_API_KEY;

const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2
?api_key=${API_KEY}`);

socket.onmessage = e => {
   const {
      TYPE: type,
      FROMSYMBOL: currency,
      PRICE: price,
   }: WSDataMessageType = JSON.parse(e.data);

   if (type !== AGGREGATE_INDEX) {
      return;
   }

   tickersHandlers.get(currency)?.forEach(cb => cb(price));
};
function sendToWebSocket(message: any) {
   const stringifiedMessage = JSON.stringify(message);
   if (socket.readyState === WebSocket.OPEN) {
      socket.send(stringifiedMessage);
      return;
   }

   socket.addEventListener("open", () => {
      socket.send(stringifiedMessage), { once: true };
   });
}
function subscribeToTickerOnWs(ticker: string) {
   sendToWebSocket({
      action: "SubAdd",
      subs: [`5~CCCAGG~${ticker}~USD`],
   });
}

function unsubscribeFromTickerOnWS(ticker: string) {
   sendToWebSocket({
      action: "SubRemove",
      subs: [`5~CCCAGG~${ticker}~USD`],
   });
}

export const subscribeToTicker = (ticker: string, cb: ICallback) => {
   const subscribers = tickersHandlers.get(ticker) || [];
   tickersHandlers.set(ticker, [...subscribers, cb]);
   subscribeToTickerOnWs(ticker);
};

export const unsubscribeFromTicker = (ticker: string) => {
   tickersHandlers.delete(ticker);
   unsubscribeFromTickerOnWS(ticker);
};

//@ts-ignore
window.tickers = tickersHandlers;
