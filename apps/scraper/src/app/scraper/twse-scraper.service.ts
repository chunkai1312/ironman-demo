import * as _ from 'lodash';
import * as numeral from 'numeral';
import * as cheerio from 'cheerio';
import * as iconv from 'iconv-lite';
import { DateTime } from 'luxon';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TwseScraperService {
  constructor(private httpService: HttpService) {}

  async fetchTseListed() {
    const url = 'https://isin.twse.com.tw/isin/class_main.jsp?market=1&issuetype=1';

    // 取得 HTML 並轉換為 Big-5 編碼
    const page = await firstValueFrom(this.httpService.get(url, { responseType: 'arraybuffer' }))
      .then(response => iconv.decode(response.data, 'big5'));

    // 使用 cheerio 載入 HTML 以取得表格的 table rows
    const $ = cheerio.load(page);
    const rows = $('.h4 tr');

    // 遍歷每個 table row 並將其轉換成我們想要的資料格式
    const data = rows.slice(1).map((i, el) => {
      const td = $(el).find('td');
      return {
        symbol: td.eq(2).text().trim(),   // 股票代碼
        name: td.eq(3).text().trim(),     // 股票名稱
        market: td.eq(4).text().trim(),   // 市場別
        industry: td.eq(6).text().trim(), // 產業別
      };
    }).toArray();

    return data;
  }

  async fetchOtcListed() {
    const url = 'https://isin.twse.com.tw/isin/class_main.jsp?market=2&issuetype=4';

    // 取得 HTML 並轉換為 Big-5 編碼
    const page = await firstValueFrom(this.httpService.get(url, { responseType: 'arraybuffer' }))
      .then(response => iconv.decode(response.data, 'big5'));

    // 使用 cheerio 載入 HTML 以取得表格的 table rows
    const $ = cheerio.load(page);
    const rows = $('.h4 tr');

    // 遍歷每個 table row 並將其轉換成我們想要的資料格式
    const data = rows.slice(1).map((i, el) => {
      const td = $(el).find('td');
      return {
        symbol: td.eq(2).text().trim(),   // 股票代碼
        name: td.eq(3).text().trim(),     // 股票名稱
        market: td.eq(4).text().trim(),   // 市場別
        industry: td.eq(6).text().trim(), // 產業別
      };
    }).toArray();

    return data;
  }

  async fetchIndexList() {
    const url = 'https://isin.twse.com.tw/isin/C_public.jsp?strMode=11';

    // 取得 HTML 並轉換為 Big-5 編碼
    const page = await firstValueFrom(this.httpService.get(url, { responseType: 'arraybuffer' }))
      .then(response => iconv.decode(response.data, 'big5'));

    // 使用 cheerio 載入 HTML 以取得表格的 table rows
    const $ = cheerio.load(page);
    const rows = $('.h4 tr');

    // 遍歷每個 table row 並將其轉換成我們想要的資料格式
    const data = rows.slice(1).map((i, el) => {
      const td = $(el).find('td');
      const [ symbol, name ] = td.eq(0).text().trim().split('　');  // 取出指數代碼與名稱
      return { symbol, name };
    }).toArray();

    return data;
  }

  async fetchTwseMarketTrades(date: string) {
    const query = new URLSearchParams({
      response: 'json',                                   // 回傳格式為 JSON
      date: DateTime.fromISO(date).toFormat('yyyyMMdd'),  // 將 ISO Date 格式轉換成 `yyyyMMdd`
    });
    const url = `https://www.twse.com.tw/exchangeReport/FMTQIK?${query}`;

    // 取得回應資料
    const responseData = await firstValueFrom(this.httpService.get(url))
      .then(response => (response.data.stat === 'OK') && response.data);

    // 若該日期非交易日或尚無成交資訊則回傳 null
    if (!responseData) return null;

    // 將回應資料整理成我們想要的資料格式
    const data = responseData.data
      .map(row => {
        // 欄位依序為: 日期, 成交股數, 成交金額, 成交筆數, 發行量加權股價指數, 漲跌點數
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

  async fetchTwseInstitutionalInvestorsNetBuySell(date: string) {
    const query = new URLSearchParams({
      response: 'json',                                       // 回傳格式為 JSON
      type: 'day',                                            // 日報表
      dayDate: DateTime.fromISO(date).toFormat('yyyyMMdd'),   // 將 ISO Date 格式轉換成 `yyyyMMdd`
    });
    const url = `https://www.twse.com.tw/fund/BFI82U?${query}`;

    // 取得回應資料
    const responseData = await firstValueFrom(this.httpService.get(url))
      .then(response => (response.data.stat === 'OK') && response.data);

    // 若該日期非交易日或尚無成交資訊則回傳 null
    if (!responseData) return null;

    // 減少一層陣列嵌套並將 string 格式數字轉換成 number
    const raw = _.flatten(responseData.data)
      .map(data => numeral(data).value() || +data)
      .filter(data => !isNaN(data));

    const [
      dpBuy,  // 自營商(自行買賣) 買進金額
      dpSell, // 自營商(自行買賣) 賣出金額
      dpNet,  // 自營商(自行買賣) 買賣差額
      dhBuy,  // 自營商(避險) 買進金額
      dhSell, // 自營商(避險) 賣出金額
      dhNet,  // 自營商(避險) 買賣差額
      itBuy,  // 投信 買進金額
      itSell, // 投信 賣出金額
      itNet,  // 投信 買賣差額
      fiBuy,  // 外資及陸資(不含外資自營商) 買進金額
      fiSell, // 外資及陸資(不含外資自營商) 賣出金額
      fiNet,  // 外資及陸資(不含外資自營商) 買賣差額
      fdBuy,  // 外資自營商 買進金額
      fdSell, // 外資自營商 賣出金額
      fdNet,  // 外資自營商 買賣差額
    ] = raw;

    const qfiiNetBuySell = fiNet + fdNet;     // 外資買賣超
    const siteNetBuySell = itNet;             // 投信買賣超
    const dealersNetBuySell = dpNet + dhNet;  // 自營商買賣超

    return { date, qfiiNetBuySell, siteNetBuySell, dealersNetBuySell };
  }

  async fetchTwseMarginTransactions(date: string) {
    const query = new URLSearchParams({
      response: 'json',                                   // 回傳格式為 JSON
      date: DateTime.fromISO(date).toFormat('yyyyMMdd'),  // 將 ISO Date 格式轉換成 `yyyyMMdd`
      selectType: 'MS',                                   // 信用交易統計
    });
    const url = `https://www.twse.com.tw/en/exchangeReport/MI_MARGN?${query}`;

    // 取得回應資料
    const responseData = await firstValueFrom(this.httpService.get(url))
      .then(response => (response.data.stat === 'OK') ? response.data : null);

    // 若該日期非交易日或尚無信用交易統計則回傳 null
    if (!responseData) return null;
    if (!responseData.creditList.length) return null;

    // 減少一層陣列嵌套並將 string 格式數字轉換成 number
    const raw = _.flatten(responseData.creditList)
      .map(data => numeral(data).value() || +data)
      .filter(data => !isNaN(data));

    const [
      marginPurchase,           // 融資(交易單位)-買進
      marginSale,               // 融資(交易單位)-賣出
      cashRedemption,           // 融資(交易單位)-現金(券)償還
      marginBalancePrev,        // 融資(交易單位)-前日餘額
      marginBalance,            // 融資(交易單位)-今日餘額
      shortCovering,            // 融券(交易單位)-買進
      shortSale,                // 融券(交易單位)-賣出
      stockRedemption,          // 融券(交易單位)-現金(券)償還
      shortBalancePrev,         // 融券(交易單位)-前日餘額
      shortBalance,             // 融券(交易單位)-今日餘額
      marginPurchaseValue,      // 融資金額(仟元)-買進
      marginSaleValue,          // 融資金額(仟元)-賣出
      cashRedemptionValue,      // 融資金額(仟元)-現金(券)償還
      marginValueBalancePrev,   // 融資金額(仟元)-前日餘額
      marginValueBalance,       // 融資金額(仟元)-今日餘額
    ] = raw;

    const margin = marginValueBalance;                                  // 融資餘額
    const marginChange = marginValueBalance - marginValueBalancePrev;   // 融資餘額增減
    const short = shortBalance;                                         // 融券餘額
    const shortChange = shortBalance - shortBalancePrev;                // 融券餘額增減

    return { date, margin, marginChange, short, shortChange };
  }

  async fetchTwseIndicesQuotes(date: string) {
    const query = new URLSearchParams({
      response: 'json',                                   // 回傳格式為 JSON
      date: DateTime.fromISO(date).toFormat('yyyyMMdd'),  // 將 ISO Date 格式轉換成 `yyyyMMdd`
    });
    const url = `https://www.twse.com.tw/exchangeReport/MI_5MINS_INDEX?${query}`;

    // 取得回應資料
    const responseData = await firstValueFrom(this.httpService.get(url))
      .then(response => (response.data.stat === 'OK') ? response.data : null);

    // 若該日期非交易日或尚無成交資訊則回傳 null
    if (!responseData) return null;

    // 整理每5秒指數統計數據
    const quotes = responseData.data.reduce((quotes, row) => {
      const [
        time,   // 時間
        IX0001, // 發行量加權股價指數
        IX0007, // 未含金融保險股指數
        IX0008, // 未含電子股指數
        IX0009, // 未含金融電子股指數
        IX0010, // 水泥類指數
        IX0011, // 食品類指數
        IX0012, // 塑膠類指數
        IX0016, // 紡織纖維類指數
        IX0017, // 電機機械類指數
        IX0018, // 電器電纜類指數
        IX0019, // 化學生技醫療類指數
        IX0020, // 化學類指數
        IX0021, // 生技醫療類指數
        IX0022, // 玻璃陶瓷類指數
        IX0023, // 造紙類指數
        IX0024, // 鋼鐵類指數
        IX0025, // 橡膠類指數
        IX0026, // 汽車類指數
        IX0027, // 電子類指數
        IX0028, // 半導體類指數
        IX0029, // 電腦及週邊設備類指數
        IX0030, // 光電類指數
        IX0031, // 通信網路類指數
        IX0032, // 電子零組件類指數
        IX0033, // 電子通路類指數
        IX0034, // 資訊服務類指數
        IX0035, // 其他電子類指數
        IX0036, // 建材營造類指數
        IX0037, // 航運類指數
        IX0038, // 觀光類指數
        IX0039, // 金融保險類指數
        IX0040, // 貿易百貨類指數
        IX0041, // 油電燃氣類指數
        IX0042, // 其他類指數
      ] = row;

      return [
        ...quotes,
        { date, time, symbol: 'IX0001', name: '發行量加權股價指數', price: numeral(IX0001).value()},
        { date, time, symbol: 'IX0007', name: '未含金融保險股指數', price: numeral(IX0007).value()},
        { date, time, symbol: 'IX0008', name: '未含電子股指數', price: numeral(IX0008).value()},
        { date, time, symbol: 'IX0009', name: '未含金融電子股指數', price: numeral(IX0009).value()},
        { date, time, symbol: 'IX0010', name: '水泥類指數', price: numeral(IX0010).value()},
        { date, time, symbol: 'IX0011', name: '食品類指數', price: numeral(IX0011).value()},
        { date, time, symbol: 'IX0012', name: '塑膠類指數', price: numeral(IX0012).value()},
        { date, time, symbol: 'IX0016', name: '紡織纖維類指數', price: numeral(IX0016).value()},
        { date, time, symbol: 'IX0017', name: '電機機械類指數', price: numeral(IX0017).value()},
        { date, time, symbol: 'IX0018', name: '電器電纜類指數', price: numeral(IX0018).value()},
        { date, time, symbol: 'IX0019', name: '化學生技醫療類指數', price: numeral(IX0019).value()},
        { date, time, symbol: 'IX0020', name: '化學類指數', price: numeral(IX0020).value()},
        { date, time, symbol: 'IX0021', name: '生技醫療類指數', price: numeral(IX0021).value()},
        { date, time, symbol: 'IX0022', name: '玻璃陶瓷類指數', price: numeral(IX0022).value()},
        { date, time, symbol: 'IX0023', name: '造紙類指數', price: numeral(IX0023).value()},
        { date, time, symbol: 'IX0024', name: '鋼鐵類指數', price: numeral(IX0024).value()},
        { date, time, symbol: 'IX0025', name: '橡膠類指數', price: numeral(IX0025).value()},
        { date, time, symbol: 'IX0026', name: '汽車類指數', price: numeral(IX0026).value()},
        { date, time, symbol: 'IX0027', name: '電子工業類指數', price: numeral(IX0027).value()},
        { date, time, symbol: 'IX0028', name: '半導體類指數', price: numeral(IX0028).value()},
        { date, time, symbol: 'IX0029', name: '電腦及週邊設備類指數', price: numeral(IX0029).value()},
        { date, time, symbol: 'IX0030', name: '光電類指數', price: numeral(IX0030).value()},
        { date, time, symbol: 'IX0031', name: '通信網路類指數', price: numeral(IX0031).value()},
        { date, time, symbol: 'IX0032', name: '電子零組件類指數', price: numeral(IX0032).value()},
        { date, time, symbol: 'IX0033', name: '電子通路類指數', price: numeral(IX0033).value()},
        { date, time, symbol: 'IX0034', name: '資訊服務類指數', price: numeral(IX0034).value()},
        { date, time, symbol: 'IX0035', name: '其他電子類指數', price: numeral(IX0035).value()},
        { date, time, symbol: 'IX0036', name: '建材營造類指數', price: numeral(IX0036).value()},
        { date, time, symbol: 'IX0037', name: '航運類指數', price: numeral(IX0037).value()},
        { date, time, symbol: 'IX0038', name: '觀光類指數', price: numeral(IX0038).value()},
        { date, time, symbol: 'IX0039', name: '金融保險類指數', price: numeral(IX0039).value()},
        { date, time, symbol: 'IX0040', name: '貿易百貨類指數', price: numeral(IX0040).value()},
        { date, time, symbol: 'IX0041', name: '油電燃氣類指數', price: numeral(IX0041).value()},
        { date, time, symbol: 'IX0042', name: '其他類指數', price: numeral(IX0042).value()},
      ];
    }, []);

    // 計算開高低收以及漲跌幅
    const data = _(quotes)
      .groupBy('symbol')
      .map((data: any[]) => {
        const [ prev, ...quotes ] = data;
        const { date, symbol, name } = prev;
        const openPrice = _.minBy(quotes, 'time').price;    // 開盤價
        const highPrice = _.maxBy(quotes, 'price').price;   // 最高價
        const lowPrice = _.minBy(quotes, 'price').price;    // 最低價
        const closePrice = _.maxBy(quotes, 'time').price;   // 收盤價
        const referencePrice = prev.price;                  // 取前次收盤價為參考價
        const change = parseFloat((_.maxBy(quotes, 'time').price - referencePrice).toPrecision(12));  // 計算漲跌
        const changePercent = Math.round(parseFloat((change / referencePrice).toPrecision(12)) * 10000) / 100;  // 計算漲跌幅
        return { date, symbol, name, openPrice, highPrice, lowPrice, closePrice, change, changePercent };
      })
      .value();

    return data;
  }
}
