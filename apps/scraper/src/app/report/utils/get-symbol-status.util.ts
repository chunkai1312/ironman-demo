// import { Ticker } from '@speculator/common';
// import { NetBuySellList } from '@speculator/common';
// import { getNetBuySellListFromTickers } from '../utils';
// import { SymbolStatus } from '../interfaces';

// export function getSymbolStatus(symbol: string, data: Record<string, Ticker[]>): SymbolStatus {
//   const [ lastDate, prevDate, ...dates ] = Object.keys(data);

//   const lastDateQfiiNetBuy = getNetBuySellListFromTickers(data[lastDate], { type: NetBuySellList.QfiiNetBuy, top: 100 });
//   const lastDateQfiiNetSell = getNetBuySellListFromTickers(data[lastDate], { type: NetBuySellList.QfiiNetSell, top: 100 });
//   const lastDateSiteNetBuy = getNetBuySellListFromTickers(data[lastDate], { type: NetBuySellList.SiteNetBuy, top: 100 });
//   const lastDateSiteNetSell = getNetBuySellListFromTickers(data[lastDate], { type: NetBuySellList.SiteNetSell, top: 100 });
//   const prevDateQfiiNetBuy = getNetBuySellListFromTickers(data[prevDate], { type: NetBuySellList.QfiiNetBuy, top: 100 });
//   const prevDateQfiiNetSell = getNetBuySellListFromTickers(data[prevDate], { type: NetBuySellList.QfiiNetSell, top: 100 });
//   const prevDateSiteNetBuy = getNetBuySellListFromTickers(data[prevDate], { type: NetBuySellList.SiteNetBuy, top: 100 });
//   const prevDateSiteNetSell = getNetBuySellListFromTickers(data[prevDate], { type: NetBuySellList.SiteNetSell, top: 100 });

//   const isQfiiContinuousBuying = !!(lastDateQfiiNetBuy.find(ticker => ticker.symbol === symbol) && prevDateQfiiNetBuy.find(data => data.symbol === symbol));
//   const isQfiiContinuousSelling = !!(lastDateQfiiNetSell.find(data => data.symbol === symbol) && prevDateQfiiNetSell.find(data => data.symbol === symbol));
//   const isSiteContinuousBuying = !!(lastDateSiteNetBuy.find(data => data.symbol === symbol) && prevDateSiteNetBuy.find(data => data.symbol === symbol));
//   const isSiteContinuousSelling = !!(lastDateSiteNetSell.find(data => data.symbol === symbol) && prevDateSiteNetSell.find(data => data.symbol === symbol));
//   const isSynchronousBuying = !!(lastDateQfiiNetBuy.find(data => data.symbol === symbol) && lastDateSiteNetBuy.find(data => data.symbol === symbol));
//   const isSynchronousSelling = !!(lastDateQfiiNetSell.find(data => data.symbol === symbol) && lastDateSiteNetSell.find(data => data.symbol === symbol));
//   const isContrarianTrading = !!((lastDateQfiiNetBuy.find(data => data.symbol === symbol) && lastDateSiteNetSell.find(data => data.symbol === symbol) || lastDateQfiiNetSell.find(data => data.symbol === symbol) && lastDateSiteNetBuy.find(data => data.symbol === symbol)));

//   const isNewEntry = [].concat(prevDate, dates).every(date => {
//     const tickers = data[date];
//     const QfiiNetBuy = getNetBuySellListFromTickers(tickers, { type: NetBuySellList.QfiiNetBuy, top: 100 });
//     const QfiiNetSell = getNetBuySellListFromTickers(tickers, { type: NetBuySellList.QfiiNetSell, top: 100 });
//     const SiteNetBuy = getNetBuySellListFromTickers(tickers, { type: NetBuySellList.SiteNetBuy, top: 100 });
//     const SiteNetSell = getNetBuySellListFromTickers(tickers, { type: NetBuySellList.SiteNetSell, top: 100 });
//     return !([].concat(
//       QfiiNetBuy.map(data => data.symbol),
//       QfiiNetSell.map(data => data.symbol),
//       SiteNetBuy.map(data => data.symbol),
//       SiteNetSell.map(data => data.symbol),
//     ).includes(symbol));
//   });

//   const isQfiiNewBuying = symbol && [].concat(prevDate, dates).every(date => {
//     const tickers = data[date];
//     const QfiiNetBuy = getNetBuySellListFromTickers(tickers, { type: NetBuySellList.QfiiNetBuy, top: 100 });
//     return !(QfiiNetBuy.map(data => data.symbol)).includes(symbol);
//   });

//   const isQfiiNewSelling = symbol &&[].concat(prevDate, dates).every(date => {
//     const tickers = data[date];
//     const QfiiNetSell = getNetBuySellListFromTickers(tickers, { type: NetBuySellList.QfiiNetSell, top: 100 });
//     return !(QfiiNetSell.map(data => data.symbol)).includes(symbol);
//   });

//   const isSiteNewBuying = symbol &&[].concat(prevDate, dates).every(date => {
//     const tickers = data[date];
//     const SiteNetBuy = getNetBuySellListFromTickers(tickers, { type: NetBuySellList.SiteNetBuy, top: 100 });
//     return !(SiteNetBuy.map(data => data.symbol)).includes(symbol);
//   });

//   const isSiteNewSelling = symbol &&[].concat(prevDate, dates).every(date => {
//     const tickers = data[date];
//     const SiteNetSell = getNetBuySellListFromTickers(tickers, { type: NetBuySellList.SiteNetSell, top: 100 });
//     return !(SiteNetSell.map(data => data.symbol)).includes(symbol);
//   });

//   return {
//     isQfiiContinuousBuying, // 外資連續買超
//     isQfiiContinuousSelling, // 外資連續賣超
//     isSiteContinuousBuying, // 投信連續買超
//     isSiteContinuousSelling, // 投信連續賣超
//     isQfiiNewBuying, // 外資新買超
//     isQfiiNewSelling, // 外資新賣超
//     isSiteNewBuying, // 投信新買超
//     isSiteNewSelling, // 投信新賣超
//     isSynchronousBuying, // 外資投信同步買超
//     isSynchronousSelling, // 外資投信同步賣超
//     isContrarianTrading, // 外投信買賣方向不同步
//   };
// }
