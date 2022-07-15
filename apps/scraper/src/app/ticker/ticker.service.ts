import { DateTime } from 'luxon';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryOptions } from 'mongoose';
import { Ticker, TickerDocument } from './ticker.schema';
import { TwseScraperService } from '../scraper/twse-scraper.service';
import { TpexScraperService } from '../scraper/tpex-scraper.service';

@Injectable()
export class TickerService {
  constructor(
    @InjectModel(Ticker.name) private readonly tickerModel: Model<TickerDocument>,
    private readonly twseScraperService: TwseScraperService,
    private readonly tpexScraperService: TpexScraperService,
  ) {}

  async updateTickers(date: string = DateTime.local().toISODate()) {
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    await Promise.all([this.updateTwseIndexQuotes(date), this.updateTpexIndexQuotes(date)]).then(() => delay(5000));
    await Promise.all([this.updateTwseMarketTrades(date), this.updateTpexMarketTrades(date)]).then(() => delay(5000));
    await Promise.all([this.updateTwseSectorTrades(date), this.updateTpexSectorTrades(date)]).then(() => delay(5000));
    await Promise.all([this.updateTwseEquityQuotes(date), this.updateTpexEquityQuotes(date)]).then(() => delay(5000));
    await Promise.all([this.updateTwseEquityInstiNetBuySell(date), this.updateTpexEquityInstiNetBuySell(date)]).then(() => delay(5000));

    Logger.log(`${date} 已完成`, TickerService.name);
  }

  @Cron('0 0 14 * * *')
  async updateTwseIndexQuotes(date: string) {
    const updated = await this.twseScraperService.fetchTwseIndicesQuotes(date)
      .then(data => data && Promise.all(data.map(ticker => this.saveTicker(ticker))));

    if (updated) Logger.log(`${date} 上市指數收盤行情: 已更新`, TickerService.name);
    else Logger.warn(`${date} 上市指數收盤行情: 尚無資料或非交易日`, TickerService.name);
  }

  @Cron('0 0 14 * * *')
  async updateTpexIndexQuotes(date: string) {
    const updated = await this.tpexScraperService.fetchTpexIndicesQuotes(date)
      .then(data => data && Promise.all(data.map(ticker => this.saveTicker(ticker))));

    if (updated) Logger.log(`${date} 上櫃指數收盤行情: 已更新`, TickerService.name);
    else Logger.warn(`${date} 上櫃指數收盤行情: 尚無資料或非交易日`, TickerService.name);
  }

  @Cron('0 30 14 * * *')
  async updateTwseMarketTrades(date: string) {
    const updated = await this.twseScraperService.fetchTwseMarketTrades(date)
      .then(data => data && {
        date,
        symbol: 'IX0001',
        tradeVolume: data.tradeVolume,
        tradeValue: data.tradeValue,
        transaction: data.transaction,
      })
      .then(ticker => ticker && this.saveTicker(ticker));

    if (updated) Logger.log(`${date} 上市大盤成交量值: 已更新`, TickerService.name);
    else Logger.warn(`${date} 上市大盤成交量值: 尚無資料或非交易日`, TickerService.name);
  }

  @Cron('0 30 14 * * *')
  async updateTpexMarketTrades(date: string) {
    const updated = await this.tpexScraperService.fetchTpexMarketTrades(date)
      .then(data => data && {
        date,
        symbol: 'IX0043',
        tradeVolume: data.tradeVolume,
        tradeValue: data.tradeValue,
        transaction: data.transaction,
      })
      .then(ticker => ticker && this.saveTicker(ticker));

    if (updated) Logger.log(`${date} 上櫃大盤成交量值: 已更新`, TickerService.name);
    else Logger.warn(`${date} 上櫃大盤成交量值: 尚無資料或非交易日`, TickerService.name);
  }

  @Cron('0 0 15 * * *')
  async updateTwseSectorTrades(date: string) {
    const updated = await this.twseScraperService.fetchTwseIndustrialIndicesTrades(date)
      .then(data => data && Promise.all(data.map(ticker => this.saveTicker(ticker))));

    if (updated) Logger.log(`${date} 上市類股成交量值: 已更新`, TickerService.name);
    else Logger.warn(`${date} 上市類股成交量值: 尚無資料或非交易日`, TickerService.name);
  }

  @Cron('0 0 15 * * *')
  async updateTpexSectorTrades(date: string) {
    const updated = await this.tpexScraperService.fetchTpexIndustrialIndicesTrades(date)
      .then(data => data && Promise.all(data.map(ticker => this.saveTicker(ticker))));

    if (updated) Logger.log(`${date} 上櫃類股成交量值: 已更新`, TickerService.name);
    else Logger.warn(`${date} 上櫃類股成交量值: 尚無資料或非交易日`, TickerService.name);
  }

  @Cron('0 0 15-21/2 * * *')
  async updateTwseEquityQuotes(date: string) {
    const updated = await this.twseScraperService.fetchTwseEquitiesQuotes(date)
      .then(data => data && Promise.all(data.map(ticker => this.saveTicker(ticker))));

    if (updated) Logger.log(`${date} 上市個股收盤行情: 已更新`, TickerService.name);
    else Logger.warn(`${date} 上市個股收盤行情: 尚無資料或非交易日`, TickerService.name);
  }

  @Cron('0 0 15-21/2 * * *')
  async updateTpexEquityQuotes(date: string) {
    const updated = await this.tpexScraperService.fetchTpexEquitiesQuotes(date)
      .then(data => data && Promise.all(data.map(ticker => this.saveTicker(ticker))));

    if (updated) Logger.log(`${date} 上櫃個股收盤行情: 已更新`, TickerService.name);
    else Logger.warn(`${date} 上櫃個股收盤行情: 尚無資料或非交易日`, TickerService.name);
  }

  @Cron('0 30 16 * * *')
  async updateTwseEquityInstiNetBuySell(date: string) {
    const updated = await this.twseScraperService.fetchTwseEquitiesInstitutionalInvestorsNetBuySell(date)
      .then(data => data && Promise.all(data.map(ticker => this.saveTicker(ticker))));

    if (updated) Logger.log(`${date} 上市個股法人進出: 已更新`, TickerService.name);
    else Logger.warn(`${date} 上市個股法人進出: 尚無資料或非交易日`, TickerService.name);
  }

  @Cron('0 30 16 * * *')
  async updateTpexEquityInstiNetBuySell(date: string) {
    const updated = await this.tpexScraperService.fetchTpexEquitiesInstitutionalInvestorsNetBuySell(date)
      .then(data => data && Promise.all(data.map(ticker => this.saveTicker(ticker))));

    if (updated) Logger.log(`${date} 上櫃個股法人進出: 已更新`, TickerService.name);
    else Logger.warn(`${date} 上櫃個股法人進出: 尚無資料或非交易日`, TickerService.name);
  }

  private async saveTicker(update: any, options?: QueryOptions): Promise<any> {
    const { date, symbol } = update;
    return this.tickerModel.updateOne({ date, symbol }, update, { ...options, upsert: true });
  }
}
