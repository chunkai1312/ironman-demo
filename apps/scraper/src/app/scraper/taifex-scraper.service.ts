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
      queryStartDate: queryDate,  // 日期(起)
      queryEndDate: queryDate,    // 日期(迄)
      commodityId: 'TXF',         // 契約
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

    const qfiiTxNetOi = qfiiNetOiVolume;        // 外資臺股期貨淨未平倉口數
    const siteTxNetOi = siteNetOiVolume;        // 投信臺股期貨淨未平倉口數
    const dealersTxNetOi = dealersNetOiVolume;  // 自營商臺股期貨淨未平倉口數

    return { date, qfiiTxNetOi, siteTxNetOi, dealersTxNetOi };
  }

  async fetchTaifexInstitutionalInvestorsTxoCallsAndPutsNetOi(date: string) {
    const queryDate = DateTime.fromISO(date).toFormat('yyyy/MM/dd');   // 將 ISO Date 格式轉換成 `yyyy/MM/dd`
    const url = 'https://www.taifex.com.tw/cht/3/callsAndPutsDateDown';

    // form data
    const form = new URLSearchParams({
      queryStartDate: queryDate,  // 日期(起)
      queryEndDate: queryDate,    // 日期(迄)
      commodityId: 'TXO',         // 契約
    });

    // 取得回應資料
    const responseData = await firstValueFrom(this.httpService.post(url, form, { responseType: 'arraybuffer' }))
      .then(response => csvtojson({ noheader: true, output: 'csv' }).fromString(iconv.decode(response.data, 'big5')));

    // 若該日期非交易日或尚無資料則回傳 null
    const [ fields, dealersCalls, siteCalls, qfiiCalls, dealersPuts, sitePuts, qfiiPuts ] = responseData;
    if (fields[0] !== '日期') return null;

    // 合併三大法人數據並將 string 格式數字轉換成 number
    const raw = [
      ...dealersCalls.slice(4),
      ...siteCalls.slice(4),
      ...qfiiCalls.slice(4),
      ...dealersPuts.slice(4),
      ...sitePuts.slice(4),
      ...qfiiPuts.slice(4),
    ].map(data => numeral(data).value());

    const [
      dealersCallsLongTradeVolume,  // 自營商 CALL 買方交易口數
      dealersCallsLongTradeValue,   // 自營商 CALL 買方交易契約金額(千元)
      dealersCallsShortTradeVolume, // 自營商 CALL 賣方交易口數
      dealersCallsShortTradeValue,  // 自營商 CALL 賣方交易契約金額(千元)
      dealersCallsNetTradeVolume,   // 自營商 CALL 交易口數買賣淨額
      dealersCallsNetTradeValue,    // 自營商 CALL 交易契約金額買賣淨額(千元)
      dealersCallsLongOiVolume,     // 自營商 CALL 買方未平倉口數,
      dealersCallsLongOiValue,      // 自營商 CALL 買方未平倉契約金額(千元)
      dealersCallsShortOiVolume,    // 自營商 CALL 賣方未平倉口數
      dealersCallsShortOiValue,     // 自營商 CALL 賣方未平倉契約金額(千元)
      dealersCallsNetOiVolume,      // 自營商 CALL 未平倉口數買賣淨額
      dealersCallsNetOiValue,       // 自營商 CALL 未平倉契約金額買賣淨額(千元)
      siteCallsLongTradeVolume,     // 投信 CALL 買方交易口數
      siteCallsLongTradeValue,      // 投信 CALL 買方交易契約金額(千元)
      siteCallsShortTradeVolume,    // 投信 CALL 賣方交易口數
      siteCallsShortTradeValue,     // 投信 CALL 賣方交易契約金額(千元)
      siteCallsNetTradeVolume,      // 投信 CALL 交易口數買賣淨額
      siteCallsNetTradeValue,       // 投信 CALL 交易契約金額買賣淨額(千元)
      siteCallsLongOiVolume,        // 投信 CALL 買方未平倉口數,
      siteCallsLongOiValue,         // 投信 CALL 買方未平倉契約金額(千元)
      siteCallsShortOiVolume,       // 投信 CALL 賣方未平倉口數
      siteCallsShortOiValue,        // 投信 CALL 賣方未平倉契約金額(千元)
      siteCallsNetOiVolume,         // 投信 CALL 未平倉口數買賣淨額
      siteCallsNetOiValue,          // 投信 CALL 未平倉契約金額買賣淨額(千元)
      qfiiCallsLongTradeVolume,     // 外資及陸資 CALL 買方交易口數
      qfiiCallsLongTradeValue,      // 外資及陸資 CALL 買方交易契約金額(千元)
      qfiiCallsShortTradeVolume,    // 外資及陸資 CALL 賣方交易口數
      qfiiCallsShortTradeValue,     // 外資及陸資 CALL 賣方交易契約金額(千元)
      qfiiCallsNetTradeVolume,      // 外資及陸資 CALL 交易口數買賣淨額
      qfiiCallsNetTradeValue,       // 外資及陸資 CALL 交易契約金額買賣淨額(千元)
      qfiiCallsLongOiVolume,        // 外資及陸資 CALL 買方未平倉口數,
      qfiiCallsLongOiValue,         // 外資及陸資 CALL 買方未平倉契約金額(千元)
      qfiiCallsShortOiVolume,       // 外資及陸資 CALL 賣方未平倉口數
      qfiiCallsShortOiValue,        // 外資及陸資 CALL 賣方未平倉契約金額(千元)
      qfiiCallsNetOiVolume,         // 外資及陸資 CALL 未平倉口數買賣淨額
      qfiiCallsNetOiValue,          // 外資及陸資 CALL 未平倉契約金額買賣淨額(千元)
      dealersPutsLongTradeVolume,   // 自營商 PUT 買方交易口數
      dealersPutsLongTradeValue,    // 自營商 PUT 買方交易契約金額(千元)
      dealersPutsShortTradeVolume,  // 自營商 PUT 賣方交易口數
      dealersPutsShortTradeValue,   // 自營商 PUT 賣方交易契約金額(千元)
      dealersPutsNetTradeVolume,    // 自營商 PUT 交易口數買賣淨額
      dealersPutsNetTradeValue,     // 自營商 PUT 交易契約金額買賣淨額(千元)
      dealersPutsLongOiVolume,      // 自營商 PUT 買方未平倉口數,
      dealersPutsLongOiValue,       // 自營商 PUT 買方未平倉契約金額(千元)
      dealersPutsShortOiVolume,     // 自營商 PUT 賣方未平倉口數
      dealersPutsShortOiValue,      // 自營商 PUT 賣方未平倉契約金額(千元)
      dealersPutsNetOiVolume,       // 自營商 PUT 未平倉口數買賣淨額
      dealersPutsNetOiValue,        // 自營商 PUT 未平倉契約金額買賣淨額(千元)
      sitePutsLongTradeVolume,      // 投信 PUT 買方交易口數
      sitePutsLongTradeValue,       // 投信 PUT 買方交易契約金額(千元)
      sitePutsShortTradeVolume,     // 投信 PUT 賣方交易口數
      sitePutsShortTradeValue,      // 投信 PUT 賣方交易契約金額(千元)
      sitePutsNetTradeVolume,       // 投信 PUT 交易口數買賣淨額
      sitePutsNetTradeValue,        // 投信 PUT 交易契約金額買賣淨額(千元)
      sitePutsLongOiVolume,         // 投信 PUT 買方未平倉口數,
      sitePutsLongOiValue,          // 投信 PUT 買方未平倉契約金額(千元)
      sitePutsShortOiVolume,        // 投信 PUT 賣方未平倉口數
      sitePutsShortOiValue,         // 投信 PUT 賣方未平倉契約金額(千元)
      sitePutsNetOiVolume,          // 投信 PUT 未平倉口數買賣淨額
      sitePutsNetOiValue,           // 投信 PUT 未平倉契約金額買賣淨額(千元)
      qfiiPutsLongTradeVolume,      // 外資及陸資 PUT 買方交易口數
      qfiiPutsLongTradeValue,       // 外資及陸資 PUT 買方交易契約金額(千元)
      qfiiPutsShortTradeVolume,     // 外資及陸資 PUT 賣方交易口數
      qfiiPutsShortTradeValue,      // 外資及陸資 PUT 賣方交易契約金額(千元)
      qfiiPutsNetTradeVolume,       // 外資及陸資 PUT 交易口數買賣淨額
      qfiiPutsNetTradeValue,        // 外資及陸資 PUT 交易契約金額買賣淨額(千元)
      qfiiPutsLongOiVolume,         // 外資及陸資 PUT 買方未平倉口數,
      qfiiPutsLongOiValue,          // 外資及陸資 PUT 買方未平倉契約金額(千元)
      qfiiPutsShortOiVolume,        // 外資及陸資 PUT 賣方未平倉口數
      qfiiPutsShortOiValue,         // 外資及陸資 PUT 賣方未平倉契約金額(千元)
      qfiiPutsNetOiVolume,          // 外資及陸資 PUT 未平倉口數買賣淨額
      qfiiPutsNetOiValue,           // 外資及陸資 PUT 未平倉契約金額買賣淨額(千元)
    ] = raw;

    const qfiiTxoCallsNetOi = qfiiCallsNetOiVolume;             // 外資臺指選擇權買權未平倉口數
    const siteTxoCallsNetOi = siteCallsNetOiVolume;             // 投信臺指選擇權買權未平倉口數
    const dealersTxoCallsNetOi = dealersCallsNetOiVolume;       // 自營商臺指選擇權買權未平倉口數
    const qfiiTxoPutsNetOi = qfiiPutsNetOiVolume;               // 外資臺指選擇權賣權未平倉口數
    const iteTxoPutsNetOi = sitePutsNetOiVolume;                // 投信臺指選擇權賣權未平倉口數
    const dealersTxoPutsNetOi = dealersPutsNetOiVolume;         // 自營商臺指選擇權賣權未平倉口數
    const qfiiTxoCallsNetOiValue = qfiiCallsNetOiValue;         // 外資臺指選擇權買權未平倉契約金額
    const siteTxoCallsNetOiValue = siteCallsNetOiValue;         // 投信臺指選擇權買權未平倉契約金額
    const dealersTxoCallsNetOiValue = dealersCallsNetOiValue;   // 自營商臺指選擇權買權未平倉契約金額
    const qfiiTxoPutsNetOiValue = qfiiPutsNetOiValue;           // 外資臺指選擇權賣權未平倉契約金額
    const siteTxoPutsNetOiValue = sitePutsNetOiValue;           // 投信臺指選擇權賣權未平倉契約金額
    const dealersTxoPutsNetOiValue = dealersPutsNetOiValue;     // 自營商臺指選擇權賣權未平倉契約金額

    return {
      date,
      qfiiTxoCallsNetOi,
      siteTxoCallsNetOi,
      dealersTxoCallsNetOi,
      qfiiTxoPutsNetOi,
      iteTxoPutsNetOi,
      dealersTxoPutsNetOi,
      qfiiTxoCallsNetOiValue,
      siteTxoCallsNetOiValue,
      dealersTxoCallsNetOiValue,
      qfiiTxoPutsNetOiValue,
      siteTxoPutsNetOiValue,
      dealersTxoPutsNetOiValue,
    };
  }
}
