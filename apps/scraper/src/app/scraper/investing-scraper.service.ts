import { investing } from 'investing-com-api';
import { flatten } from 'lodash';
import { DateTime } from 'luxon';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class InvestingScraperService {
  constructor(private httpService: HttpService) {}

  async fetchUsTreasuryYields(date: string) {
    const dt = DateTime.fromISO(date);

    // 從 investing.com 取得近一個月美國公債殖利率數據
    const quotes = await Promise.all([
      investing('rates-bonds/u.s.-3-month-bond-yield'),
      investing('rates-bonds/u.s.-2-year-bond-yield'),
      investing('rates-bonds/u.s.-10-year-bond-yield'),
    ]).then(results => flatten(results)
      .map((quote: any) => ({ ...quote, date: DateTime.fromMillis(quote.date).toISODate() }))
      .filter((quote: any) => quote.date === dt.toISODate())
      .map((quote: any) => quote.value)
    );

    const [
      us3m,  // 美國3個月期公債殖利率
      us2y,  // 美國2年期公債殖利率
      us10y, // 美國10年期公債殖利率
    ] = quotes;

    return { date, us3m, us2y, us10y };
  }
}
