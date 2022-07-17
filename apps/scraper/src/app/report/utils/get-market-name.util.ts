import { Market } from "@speculator/common";

export function getMarketName(market: Market) {
  const markets = {
    [Market.TSE]: '上市',
    [Market.OTC]: '上櫃',
  }
  return markets[market];
}
