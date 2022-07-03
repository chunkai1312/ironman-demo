import * as numeral from 'numeral';
import { flatten } from 'lodash';
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

  async fetchTpexInstitutionalInvestorsNetBuySell(date: string) {
    const dt = DateTime.fromISO(date);
    const formattedDate = `${dt.get('year') - 1911}/${dt.toFormat('MM')}/${dt.toFormat('dd')}`; // 將 ISO Date 格式轉換成 `民國年//MM`
    const query = new URLSearchParams({ l: 'zh-tw', t: 'D', d: formattedDate, o: 'json' });     // 建立 URL 查詢參數
    const url = `https://www.tpex.org.tw/web/stock/3insti/3insti_summary/3itrdsum_result.php?${query}`;

    // 取得回應資料
    const responseData = await firstValueFrom(this.httpService.get(url))
      .then(response => (response.data.iTotalRecords > 0) && response.data);

    // 若該日期非交易日或尚無成交資訊則回傳 null
    if (!responseData) return null;

    // 減少一層陣列嵌套並將 string 格式數字轉換成 number
    const raw = flatten(responseData.aaData)
      .map(data => numeral(data).value() || +data)
      .filter(data => !isNaN(data));

    const [
      qfiiBuy,      // 外資及陸資合計 買進金額(元)
      qfiiSell,     // 外資及陸資合計 賣出金額(元)
      qfiiNet,      // 外資及陸資合計 買賣超(元)
      fiBuy,        // 外資及陸資(不含自營商) 買進金額(元)
      fiSell,       // 外資及陸資(不含自營商) 賣出金額(元)
      fiNet,        // 外資及陸資(不含自營商) 買賣超(元)
      fdBuy,        // 外資自營商 買進金額(元)
      fdSell,       // 外資自營商 賣出金額(元)
      fdNet,        // 外資自營商 買賣超(元)
      itBuy,        // 投信 買進金額(元)
      itSell,       // 投信 賣出金額(元)
      itNet,        // 投信 買賣超(元)
      dealersBuy,   // 自營商合計 買進金額(元)
      dealersSell,  // 自營商合計 賣出金額(元)
      dealersNet,   // 自營商合計 買賣超(元)
      dpBuy,        // 自營商(自行買賣) 買進金額(元)
      dpSell,       // 自營商(自行買賣) 賣出金額(元)
      dpNet,        // 自營商(自行買賣) 買賣超(元)
      dhBuy,        // 自營商(避險) 買進金額(元)
      dhSell,       // 自營商(避險) 賣出金額(元)
      dhNet,        // 自營商(避險) 買賣超(元)
    ] = raw;

    const qfiiNetBuySell = qfiiNet;         // 外資買賣超
    const siteNetBuySell = itNet;           // 投信買賣超
    const dealersNetBuySell = dealersNet;   // 自營商買賣超

    return { date, qfiiNetBuySell, siteNetBuySell, dealersNetBuySell };
  }
}
