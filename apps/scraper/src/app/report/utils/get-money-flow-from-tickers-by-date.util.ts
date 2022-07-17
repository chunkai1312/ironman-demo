// import { Ticker, Exchange, Index } from '@speculator/common';
// import { NetBuySellList } from '../enums/net-buy-sell-list.enum';

// interface Options {
//   exchange: Exchange;
//   days?: number;
// }

// export function getMoneyFlowFromTickersByDate(data: Record<string, Ticker[]>, options: Options) {
//   const marketIndex = (options.exchange === Exchange.TPEx) ? Index.TPEX : Index.TAIEX;
//   const [ lastDate, prevDate, ...dates ] = Object.keys(data);

//   const moneyFlow = Object.keys(data).reduce((moneyFlow, date, i) => {
//     const market = data[date].find(ticker => ticker.symbol === marketIndex);
//     const tickers = data[date]
//       .filter(ticker => ticker.exchange == options.exchange && ticker.symbol !== market?.symbol)
//       .sort((a, b) => b.changePercent - a.changePercent);

//     return { ...moneyFlow, [date]: [].concat(market, ...tickers) };
//   }, {});

//   return moneyFlow;
// }
