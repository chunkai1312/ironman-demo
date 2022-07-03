import * as iconv from 'iconv-lite';
import * as csvtojson from 'csvtojson';
import * as numeral from 'numeral';
import { DateTime } from 'luxon';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TaifexScraperService {
  constructor(private httpService: HttpService) {}

  async fetchTaifexInstitutionalInvestorsTxNetOi(date: string) {
    const queryDate = DateTime.fromISO(date).toFormat('yyyy/MM/dd');   // 將 ISO Date 格式轉換成 `yyyy/MM/dd`
    const url = 'https://www.taifex.com.tw/cht/3/futContractsDateDown';

    // form data
    const form = new URLSearchParams({
      queryStartDate: queryDate,
      queryEndDate: queryDate,
      commodityId: 'TXF',
    });

    // 取得回應資料
    const responseData = await firstValueFrom(this.httpService.post(url, form, { responseType: 'arraybuffer' }))
      .then(response => csvtojson({ noheader: true, output: 'csv' }).fromString(iconv.decode(response.data, 'big5')));

    // 若該日期非交易日或尚無資料則回傳 null
    const [ fields, dealers, site, qfii ] = responseData;
    if (fields[0] !== '日期') return null;

    // 合併三大法人數據並將 string 格式數字轉換成 number
    const raw = [ ...dealers.slice(3), ...site.slice(3), ...qfii.slice(3) ]
      .map(data => numeral(data).value());

    const [
      dealersLongTradeVolume,   // 自營商 多方交易口數
      dealersLongTradeValue,    // 自營商 多方交易契約金額(千元)
      dealersShortTradeVolume,  // 自營商 空方交易口數
      dealersShortTradeValue,   // 自營商 空方交易契約金額(千元)
      dealersNetTradeVolume,    // 自營商 多空交易口數淨額
      dealersNetTradeValue,     // 自營商 多空交易契約金額淨額(千元)
      dealersLongOiVolume,      // 自營商 多方未平倉口數
      dealersLongOiValue,       // 自營商 多方未平倉契約金額(千元)
      dealersShortOiVolume,     // 自營商 空方未平倉口數
      dealersShortOiValue,      // 自營商 空方未平倉契約金額(千元)
      dealersNetOiVolume,       // 自營商 多空未平倉口數淨額
      dealersNetOiValue,        // 自營商 多空未平倉契約金額淨額(千元)
      siteLongTradeVolume,      // 投信 多方交易口數
      siteLongTradeValue,       // 投信 多方交易契約金額(千元)
      siteShortTradeVolume,     // 投信 空方交易口數
      siteShortTradeValue,      // 投信 空方交易契約金額(千元)
      siteNetTradeVolume,       // 投信 多空交易口數淨額
      siteNetTradeValue,        // 投信 多空交易契約金額淨額(千元)
      siteLongOiVolume,         // 投信 多方未平倉口數
      siteLongOiValue,          // 投信 多方未平倉契約金額(千元)
      siteShortOiVolume,        // 投信 空方未平倉口數
      siteShortOiValue,         // 投信 空方未平倉契約金額(千元)
      siteNetOiVolume,          // 投信 多空未平倉口數淨額
      siteNetOiValue,           // 投信 多空未平倉契約金額淨額(千元)
      qfiiLongTradeVolume,      // 外資及陸資 多方交易口數
      qfiiLongTradeValue,       // 外資及陸資 多方交易契約金額(千元)
      qfiiShortTradeVolume,     // 外資及陸資 空方交易口數
      qfiiShortTradeValue,      // 外資及陸資 空方交易契約金額(千元)
      qfiiNetTradeVolume,       // 外資及陸資 多空交易口數淨額
      qfiiNetTradeValue,        // 外資及陸資 多空交易契約金額淨額(千元)
      qfiiLongOiVolume,         // 外資及陸資 多方未平倉口數
      qfiiLongOiValue,          // 外資及陸資 多方未平倉契約金額(千元)
      qfiiShortOiVolume,        // 外資及陸資 空方未平倉口數
      qfiiShortOiValue,         // 外資及陸資 空方未平倉契約金額(千元)
      qfiiNetOiVolume,          // 外資及陸資 多空未平倉口數淨額
      qfiiNetOiValue,           // 外資及陸資 多空未平倉契約金額淨額(千元)
    ] = raw;

    const qfiiTxNetOi = qfiiNetOiVolume;        // 外資臺股期貨淨未平倉
    const siteTxNetOi = siteNetOiVolume;        // 投信臺股期貨淨未平倉
    const dealersTxNetOi = dealersNetOiVolume;  // 自營商臺股期貨淨未平倉

    return { date, qfiiTxNetOi, siteTxNetOi, dealersTxNetOi };
  }
}
