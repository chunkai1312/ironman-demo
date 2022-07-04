import * as _ from 'lodash';
import * as cheerio from 'cheerio';
import * as iconv from 'iconv-lite';
import * as numeral from 'numeral';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MopsScraperService {
  constructor(private httpService: HttpService) {}

  async fetchCompaniesQuarterlyEps(market: 'sii' | 'otc' | 'rotc' | 'pub', year: string, quarter: '01' | '02' | '03' | '04') {
    const url = 'https://mops.twse.com.tw/mops/web/t163sb04';

    // form data
    const form = new URLSearchParams({
      encodeURIComponent: '1',
      step: '1',
      firstin: '1',
      off: '1',
      isQuery: 'Y',
      TYPEK: market,
      year: String(+year - 1911),  // 日期(起)
      season: quarter,
    });

    // 取得 HTML 頁面
    const page = await firstValueFrom(this.httpService.post(url, form)).then(response => response.data);

    // 使用 cheerio 載入 HTML 以取得表格的 table rows
    const $ = cheerio.load(page);

    // 遍歷每個 table row 並將其轉換成我們想要的資料格式
    const data = $('.even,.odd').map((i, el) => {
      const td = $(el).find('td');
      return {
        symbol: td.eq(0).text().trim(),           // 公司代號
        name: td.eq(1).text().trim(),             // 公司名稱
        eps: td.eq(td.length - 1).text().trim(),  // 基本每股盈餘(元)
      };
    }).toArray();

    return _.sortBy(data, 'symbol');  // 依代碼排序
  }

  async fetchCompaniesMonthlyRevenue(market: 'sii' | 'otc' | 'rotc' | 'pub', year: string, month: string, type: '0' | '1') {
    const url = `https://mops.twse.com.tw/nas/t21/${market}/t21sc03_${String(+year - 1911)}_${month}_${type}.html`;

    // 取得 HTML 並轉換為 Big-5 編碼
    const page = await firstValueFrom(this.httpService.get(url, { responseType: 'arraybuffer' }))
      .then(response => iconv.decode(response.data, 'big5'));

    // 使用 cheerio 載入 HTML 以取得表格的 table rows
    const $ = cheerio.load(page);

    // 遍歷每個 table row 並將其轉換成我們想要的資料格式
    const data = $('tr [align=right]')
      .filter((i, el) => {
        const th = $(el).find('th');
        const td = $(el).find('td');
        return (th.length === 0) && !!td.eq(0).text();
      })
      .map((i, el) => {
        const td = $(el).find('td');
        return {
          symbol: td.eq(0).text().trim(),                     // 公司代號
          name: td.eq(1).text().trim(),                       // 公司名稱
          revenue: numeral(td.eq(2).text().trim()).value(),   // 當月營收
        };
      })
      .toArray();

    return _.sortBy(data, 'symbol');  // 依代碼排序
  }
}
