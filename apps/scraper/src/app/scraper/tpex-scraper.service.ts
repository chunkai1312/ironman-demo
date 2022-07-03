import * as numeral from 'numeral';
import { DateTime } from 'luxon';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TpexScraperService {
  constructor(private httpService: HttpService) {}

  async fetchTpexMarketTrades(date: string) {
    const dt = DateTime.fromISO(date);
    const formattedDate = `${dt.get('year') - 1911}/${dt.toFormat('MM')}`;          // 將 ISO Date 格式轉換成 `民國年//MM`
    const query = new URLSearchParams({ l: 'zh-tw', d: formattedDate, o: 'json' }); // 建立 URL 查詢參數
    const url = `https://www.tpex.org.tw/web/stock/aftertrading/daily_trading_index/st41_result.php?${query}`;

    // 取得回應資料
    const responseData = await firstValueFrom(this.httpService.get(url))
      .then(response => (response.data.iTotalRecords > 0) && response.data);

    // 若該日期非交易日或尚無成交資訊則回傳 null
    if (!responseData) return null;

    // 將回應資料整理成我們想要的資料格式
    const data = responseData.aaData.map(row => {
      // 欄位依序為: 日期, 成交股數(仟股), 金額(仟元), 筆數, 櫃買指數, 漲/跌
      const [ date, tradeVolume, tradeValue, transaction, price, change ] = row;

      // 將 `民國年/MM/dd` 的日期格式轉換成 `yyyy-MM-dd`
      const [ year, month, day ] = date.split('/');
      const formattedDate = DateTime.fromFormat(`${+year + 1911}${month}${day}`, 'yyyyMMdd').toISODate();

      return {
        date: formattedDate,
        tradeVolume: numeral(tradeVolume).value(),
        tradeValue: numeral(tradeValue).value(),
        transaction: numeral(transaction).value(),
        price: numeral(price).value(),
        change: numeral(change).value(),
      };
    })
    .find(data => data.date === date) || null;  // 取得目標日期的成交資訊

    return data;
  }
}
