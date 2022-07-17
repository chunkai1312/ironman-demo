// import { Ticker, Exchange } from '@speculator/common';
// import { NetBuySellList } from '../enums';

// interface Options {
//   type: NetBuySellList;
//   top?: number;
// }

// export function getNetBuySellListFromTickers(tickers: Ticker[], options: Options) {
//   const top = options?.top || 100;

//   const lists = {
//     [NetBuySellList.QfiiNetBuy]: () => {
//       return tickers
//         .filter(ticker => ticker.qfiiNetBuySell > 0)
//         .sort((a, b) => b.qfiiNetBuySell - a.qfiiNetBuySell).slice(0, top);
//     },
//     [NetBuySellList.QfiiNetSell]: () => {
//       return tickers
//         .filter(ticker => ticker.qfiiNetBuySell < 0)
//         .sort((a, b) => a.qfiiNetBuySell - b.qfiiNetBuySell).slice(0, top);
//     },
//     [NetBuySellList.SiteNetBuy]: () => {
//       return tickers
//         .filter(ticker => ticker.siteNetBuySell > 0)
//         .sort((a, b) => b.siteNetBuySell - a.siteNetBuySell).slice(0, top);
//     },
//     [NetBuySellList.SiteNetSell]: () => {
//       return tickers
//         .filter(ticker => ticker.siteNetBuySell < 0)
//         .sort((a, b) => a.siteNetBuySell - b.siteNetBuySell).slice(0, top);
//     },
//     [NetBuySellList.TwseQfiiNetBuy]: () => {
//       return tickers
//         .filter(ticker => ticker.exchange === Exchange.TWSE && ticker.qfiiNetBuySell > 0)
//         .sort((a, b) => b.qfiiNetBuySell - a.qfiiNetBuySell).slice(0, top);
//     },
//     [NetBuySellList.TwseQfiiNetSell]: () => {
//       return tickers
//         .filter(ticker => ticker.exchange === Exchange.TWSE && ticker.qfiiNetBuySell < 0)
//         .sort((a, b) => a.qfiiNetBuySell - b.qfiiNetBuySell).slice(0, top);
//     },
//     [NetBuySellList.TwseSiteNetBuy]: () => {
//       return tickers
//         .filter(ticker => ticker.exchange === Exchange.TWSE && ticker.siteNetBuySell > 0)
//         .sort((a, b) => b.siteNetBuySell - a.siteNetBuySell).slice(0, top);
//     },
//     [NetBuySellList.TwseSiteNetSell]: () => {
//       return tickers
//         .filter(ticker => ticker.exchange === Exchange.TWSE && ticker.siteNetBuySell < 0)
//         .sort((a, b) => a.siteNetBuySell - b.siteNetBuySell).slice(0, top);
//     },
//     [NetBuySellList.TpexQfiiNetBuy]: () => {
//       return tickers
//         .filter(ticker => ticker.exchange === Exchange.TPEx && ticker.qfiiNetBuySell > 0)
//         .sort((a, b) => b.qfiiNetBuySell - a.qfiiNetBuySell).slice(0, top);
//     },
//     [NetBuySellList.TpexQfiiNetSell]: () => {
//       return tickers
//         .filter(ticker => ticker.exchange === Exchange.TPEx && ticker.qfiiNetBuySell < 0)
//         .sort((a, b) => a.qfiiNetBuySell - b.qfiiNetBuySell).slice(0, top);
//     },
//     [NetBuySellList.TpexSiteNetBuy]: () => {
//       return tickers
//         .filter(ticker => ticker.exchange === Exchange.TPEx && ticker.siteNetBuySell > 0)
//         .sort((a, b) => b.siteNetBuySell - a.siteNetBuySell).slice(0, top);
//     },
//     [NetBuySellList.TpexSiteNetSell]: () => {
//       return tickers
//         .filter(ticker => ticker.exchange === Exchange.TPEx && ticker.siteNetBuySell < 0)
//         .sort((a, b) => a.siteNetBuySell - b.siteNetBuySell).slice(0, top);
//     },
//   }

//   return lists[options.type]();
// }
