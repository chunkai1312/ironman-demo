import * as yahooFinance from 'yahoo-finance';
import { flatMap } from 'lodash';
import { DateTime } from 'luxon';
import { Injectable } from '@nestjs/common';

@Injectable()
export class YahooFinanceService {
  constructor() {}

  async fetchUsStockMarketIndices(date: string) {
    const dt = DateTime.fromISO(date).endOf('day');
    const symbols = ['^DJI', '^GSPC', '^IXIC', '^SOX'];

    // 取得 yahoo finance 歷史報價
    const quotes = await yahooFinance.historical({
      symbols,
      from: dt.toISO(),
      to: dt.toISO(),
    }).then(quotes => flatMap(quotes)
      .filter((quote: any) => DateTime.fromJSDate(quote.date).toISODate() === dt.toISODate())
      .map((quote: any) => quote.close)
    );

    // 若非交易日或尚無資料則回傳 null
    if (!quotes.length) return null;

    const [
      dow30,  // 道瓊工業指數
      sp500,  // S&P500 指數
      nasdaq, // 那斯達克指數
      sox,    // 費城半導體指數
    ] = quotes;

    return { date, dow30, sp500, nasdaq, sox };
  }
}
