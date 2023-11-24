import { TickerType } from "../types/ticker.type";
import { WSDataMessageType } from "../types/websocketDataMessage";

const AGGREGATE_INDEX = "5";

interface ICallback {
   (value: number): void;
}

interface IBCData {
   type: "update" | "add" | "remove";
   currency: string;
   price?: number;
   mainThread: boolean;
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

let addTickerCB = (name: string) => {};
let removeTickerCB = (name: string) => {};

export function addTickerMutation(cb: (val: string) => void) {
   addTickerCB = cb;
}
export function removeTickerMutation(cb: (val: string) => void) {
   removeTickerCB = cb;
}
export function subscribeToMutations(tickers: TickerType[]) {
   setTimeout(() => {
      tickers.push({ name: "AZAZA", price: 239 });
   }, 3000);
}

bc.onmessage = ev => {
   const data: IBCData = ev.data;
   const { currency, type, mainThread, price } = data;
   if (type === "update" && price && mainThread) {
      tickersHandlers.get(currency)?.forEach(cb => cb(price));
   }
   if (type === "add" && !tickersHandlers.get(currency)) {
      addTickerCB(currency);
   }
   if (type === "remove" && tickersHandlers.get(currency)) {
      removeTickerCB(currency);
   }
};

socket.onmessage = e => {
   const {
      TYPE: type,
      FROMSYMBOL: currency,
      PRICE: price,
   }: WSDataMessageType = JSON.parse(e.data);

   if (type === "429") {
      socket.close();
      return;
   }

   if (type !== AGGREGATE_INDEX) {
      return;
   }

   tickersHandlers.get(currency)?.forEach(cb => cb(price));
   sendToBroadcastChannel({ currency, price, type: "update" });
};

function sendToBroadcastChannel({
   currency,
   type,
   price,
}: {
   currency: string;
   type: "update" | "add" | "remove";
   price?: number;
}) {
   const message: IBCData = {
      mainThread: socket.readyState === 1,
      currency,
      type,
      price,
   };
   bc.postMessage(message);
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

   sendToBroadcastChannel({ currency: ticker, type: "remove" });
};
