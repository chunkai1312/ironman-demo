// import { Ticker, Exchange } from '@speculator/common';
// import { Movers } from '../enums/movers.enum';

// interface Options {
//   type: Movers;
//   top?: number;
// }

// export function getMoversFromTickers(tickers: Ticker[], options: Options) {
//   const top = options?.top || 50;

//   const lists = {
//     [Movers.Gainers]: () => {
//       return tickers
//         .filter(ticker => ticker.changePercent > 0)
//         .sort((a, b) => b.changePercent - a.changePercent).slice(0, top);
//     },
//     [Movers.Losers]: () => {
//       return tickers
//         .filter(ticker => ticker.changePercent < 0)
//         .sort((a, b) => a.changePercent - b.changePercent).slice(0, top);
//     },
//     [Movers.TwseGainers]: () => {
//       return tickers
//         .filter(ticker => ticker.exchange === Exchange.TWSE && ticker.changePercent > 0)
//         .sort((a, b) => b.changePercent - a.changePercent).slice(0, top);
//     },
//     [Movers.TwseLosers]: () => {
//       return tickers
//         .filter(ticker => ticker.exchange === Exchange.TWSE && ticker.changePercent < 0)
//         .sort((a, b) => a.changePercent - b.changePercent).slice(0, top);
//     },
//     [Movers.TpexGainers]: () => {
//       return tickers
//         .filter(ticker => ticker.exchange === Exchange.TPEx && ticker.changePercent > 0)
//         .sort((a, b) => b.changePercent - a.changePercent).slice(0, top);
//     },
//     [Movers.TpexLosers]: () => {
//       return tickers
//         .filter(ticker => ticker.exchange === Exchange.TPEx && ticker.changePercent < 0)
//         .sort((a, b) => a.changePercent - b.changePercent).slice(0, top);
//     },
//   }

//   return lists[options.type]();
// }
