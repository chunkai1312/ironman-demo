export interface SymbolStatus {
  isQfiiContinuousBuying: boolean; // 外資連續買超
  isQfiiContinuousSelling: boolean; // 外資連續賣超
  isSiteContinuousBuying: boolean; // 投信連續買超
  isSiteContinuousSelling: boolean; // 投信連續賣超
  isQfiiNewBuying: boolean; // 外資新買超
  isQfiiNewSelling: boolean; // 外資新賣超
  isSiteNewBuying: boolean; // 投信新買超
  isSiteNewSelling: boolean; // 投信新賣超
  isSynchronousBuying: boolean; // 外資投信同步買超
  isSynchronousSelling: boolean; // 外資投信同步賣超
  isContrarianTrading: boolean; // 外投信買賣方向不同步
}
