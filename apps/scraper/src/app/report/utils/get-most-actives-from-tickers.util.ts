// import { Ticker, Exchange } from '@speculator/common';
// import { MostActives } from '../enums/most-actives.enum';

// interface Options {
//   type: MostActives;
//   top?: number;
// }

// export function getMostActivesFromTickers(tickers: Ticker[], options: Options) {
//   const top = options?.top || 50;

//   const lists = {
//     [MostActives.TradeVolume]: () => {
//       return tickers
//         .filter(ticker => ticker.tradeVolume > 0)
//         .sort((a, b) => b.tradeVolume - a.tradeVolume).slice(0, top);
//     },
//     [MostActives.TradeValue]: () => {
//       return tickers
//         .filter(ticker => ticker.tradeValue > 0)
//         .sort((a, b) => b.tradeValue - a.tradeValue).slice(0, top);
//     },
//     [MostActives.TwseTradeVolume]: () => {
//       return tickers
//         .filter(ticker => ticker.exchange === Exchange.TWSE && ticker.tradeVolume > 0)
//         .sort((a, b) => b.tradeVolume - a.tradeVolume).slice(0, top);
//     },
//     [MostActives.TwseTradeValue]: () => {
//       return tickers
//         .filter(ticker => ticker.exchange === Exchange.TWSE && ticker.tradeValue > 0)
//         .sort((a, b) => b.tradeValue - a.tradeValue).slice(0, top);
//     },
//     [MostActives.TpexTradeVolume]: () => {
//       return tickers
//         .filter(ticker => ticker.exchange === Exchange.TPEx && ticker.tradeVolume > 0)
//         .sort((a, b) => b.tradeVolume - a.tradeVolume).slice(0, top);
//     },
//     [MostActives.TpexTradeValue]: () => {
//       return tickers
//         .filter(ticker => ticker.exchange === Exchange.TPEx && ticker.tradeValue > 0)
//         .sort((a, b) => b.tradeValue - a.tradeValue).slice(0, top);
//     },
//   }

//   return lists[options.type]();
// }
