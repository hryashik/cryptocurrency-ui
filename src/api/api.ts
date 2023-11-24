import { WSDataMessageType } from "../types/websocketDataMessage";

const AGGREGATE_INDEX = "5";

interface ICallback {
   (value: number): void;
}

interface IBCData {
   type: "update" | "add";
   currency: string;
   price?: number;
}

export const stateApi: any = {
   listenAddTicker(cb: () => void) {
      this.addTicker = cb;
   },
};

const tickersHandlers = new Map<string, ICallback[]>();

const API_KEY = import.meta.env.VITE_API_KEY;

const bc = new BroadcastChannel("test");

const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2
?api_key=${API_KEY}`);

socket.onmessage = e => {
   const {
      TYPE: type,
      FROMSYMBOL: currency,
      PRICE: price,
   }: WSDataMessageType = JSON.parse(e.data);

   if (type === "429") {
      socket.close();
      bc.onmessage = ev => {
         const { currency, price, type }: IBCData = ev.data;
         if (type === "update" && price) {
            tickersHandlers.get(currency)?.forEach(cb => cb(price));
         }
         if (type === "add") {
            stateApi.addTicker(currency);
         }
      };
      return;
   }

   if (type !== AGGREGATE_INDEX) {
      return;
   }

   tickersHandlers.get(currency)?.forEach(cb => cb(price));
   sendToBroadcastChannel({ currency, price, type: "update" });
};
function sendToBroadcastChannel(data: IBCData) {
   bc.postMessage(data);
}

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

   sendToBroadcastChannel({ currency: ticker, type: "add" });
};

export const unsubscribeFromTicker = (ticker: string) => {
   tickersHandlers.delete(ticker);
   unsubscribeFromTickerOnWS(ticker);
};

//@ts-ignore
window.tickers = tickersHandlers;
