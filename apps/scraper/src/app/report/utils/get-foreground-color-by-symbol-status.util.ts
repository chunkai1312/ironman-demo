import { NetBuySellSheetColumn, ForegroundColor } from '../enums';
import { SymbolStatus } from '../interfaces/symbol-status.interface';

interface Options {
  column: NetBuySellSheetColumn;
}

export function getForegroundColorBySymbolStatus(symbolStatus: SymbolStatus, options: Options): ForegroundColor {
  const colors = {
    [NetBuySellSheetColumn.SymbolOfQfiiNetBuy]: () => {
      if (symbolStatus.isQfiiContinuousBuying) return ForegroundColor.Continuous;
      if (symbolStatus.isQfiiNewBuying) return ForegroundColor.Notice;
      return ForegroundColor.Normal;
    },
    [NetBuySellSheetColumn.NameOfQfiiNetBuy]: () => {
      if (symbolStatus.isSynchronousBuying) return ForegroundColor.Synchronous;
      if (symbolStatus.isContrarianTrading) return ForegroundColor.Contrarian;
      return ForegroundColor.Normal;
    },
    [NetBuySellSheetColumn.SymbolOfQfiiNetSell]: () => {
      if (symbolStatus.isQfiiContinuousSelling) return ForegroundColor.Continuous;
      if (symbolStatus.isQfiiNewSelling) return ForegroundColor.Notice;
      return ForegroundColor.Normal;
    },
    [NetBuySellSheetColumn.NameOfQfiiNetSell]: () => {
      if (symbolStatus.isSynchronousSelling) return ForegroundColor.Synchronous;
      if (symbolStatus.isContrarianTrading) return ForegroundColor.Contrarian;
      return ForegroundColor.Normal;
    },
    [NetBuySellSheetColumn.SymbolOfSiteNetBuy]: () => {
      if (symbolStatus.isSiteContinuousBuying) return ForegroundColor.Continuous;
      if (symbolStatus.isSiteNewBuying) return ForegroundColor.Notice;
      return ForegroundColor.Normal;
    },
    [NetBuySellSheetColumn.NameOfSiteNetBuy]: () => {
      if (symbolStatus.isSynchronousBuying) return ForegroundColor.Synchronous;
      if (symbolStatus.isContrarianTrading) return ForegroundColor.Contrarian;
      return ForegroundColor.Normal;
    },
    [NetBuySellSheetColumn.SymbolOfSiteNetSell]: () => {
      if (symbolStatus.isSiteContinuousSelling) return ForegroundColor.Continuous;
      if (symbolStatus.isSiteNewSelling) return ForegroundColor.Notice;
      return ForegroundColor.Normal;
    },
    [NetBuySellSheetColumn.NameOfSiteNetSell]: () => {
      if (symbolStatus.isSynchronousSelling) return ForegroundColor.Synchronous;
      if (symbolStatus.isContrarianTrading) return ForegroundColor.Contrarian;
      return ForegroundColor.Normal;
    },
  }

  return colors[options.column]() || ForegroundColor.Normal;
}
