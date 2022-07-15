import { DateTime } from 'luxon';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MarketStatsRepository } from './market-stats.repository';
import { TwseScraperService } from '../scraper/twse-scraper.service';
import { TaifexScraperService } from '../scraper/taifex-scraper.service';
import { InvestingScraperService } from '../scraper/investing-scraper.service';

@Injectable()
export class MarketStatsService {
  constructor(
    private readonly marketStatsRepository: MarketStatsRepository,
    private readonly twseScraperService: TwseScraperService,
    private readonly taifexScraperService: TaifexScraperService,
    private readonly investingScraperService: InvestingScraperService,
  ) {}

  async onApplicationBootstrap() {
    await this.updateMarketStats();
  }

  async updateMarketStats(date: string = DateTime.local().toISODate()) {
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    await this.updateTaiex(date).then(() => delay(5000));
    await this.updateInstiNetBuySell(date).then(() => delay(5000));
    await this.updateMarginTransactions(date).then(() => delay(5000));
    await this.updateQfiiTxNetOi(date).then(() => delay(5000));
    await this.updateQfiiTxoCallsAndPutsNetOiValue(date).then(() => delay(5000));
    await this.updateLargeTraderTxNetOi(date).then(() => delay(5000));
    await this.updateRetailMtxNetOi(date).then(() => delay(5000));
    await this.updateTxoPutCallRatio(date).then(() => delay(5000));
    await this.updateUsdTwdRate(date).then(() => delay(5000));
    await this.updateUsTreasuryYields(date).then(() => delay(5000));

    Logger.log(`${date} 已完成`, MarketStatsService.name);
  }

  @Cron('0 0 15 * * *')
  async updateTaiex(date: string) {
    const updated = await this.twseScraperService.fetchTwseMarketTrades(date)
      .then(data => data && {
        date,
        taiexPrice: data.price,
        taiexChange: data.change,
        taiexChangePercent: data.changePercent,
        taiexTradeValue: data.tradeValue,
      })
      .then(data => data && this.marketStatsRepository.updateMarketStats(data))

    if (updated) Logger.log(`${date} 加權指數: 已更新`, MarketStatsService.name);
    else Logger.warn(`${date} 加權指數: 尚無資料或非交易日`, MarketStatsService.name);
  }

  @Cron('0 30 15 * * *')
  async updateInstiNetBuySell(date: string) {
    const updated = await this.twseScraperService.fetchTwseInstitutionalInvestorsNetBuySell(date)
      .then(data => data && {
        date,
        qfiiNetBuySell: data.qfiiNetBuySell,
        siteNetBuySell: data.siteNetBuySell,
        dealersNetBuySell: data.dealersNetBuySell,
      })
      .then(data => data && this.marketStatsRepository.updateMarketStats(data))

    if (updated) Logger.log(`${date} 三大法人買賣超: 已更新`, MarketStatsService.name);
    else Logger.warn(`${date} 三大法人買賣超: 尚無資料或非交易日`, MarketStatsService.name);
  }

  @Cron('0 30 21 * * *')
  async updateMarginTransactions(date: string) {
    const updated = await this.twseScraperService.fetchTwseMarginTransactions(date)
      .then(data => data && {
        date,
        margin: data.margin,
        marginChange: data.marginChange,
        short: data.short,
        shortChange: data.shortChange,
      })
      .then(data => data && this.marketStatsRepository.updateMarketStats(data));

    if (updated) Logger.log(`${date} 信用交易: 已更新`, MarketStatsService.name);
    else Logger.warn(`${date} 信用交易: 尚無資料或非交易日`, MarketStatsService.name);
  }

  @Cron('0 0 15 * * *')
  async updateQfiiTxNetOi(date: string) {
    const updated = await this.taifexScraperService.fetchTaifexInstitutionalInvestorsTxNetOi(date)
      .then(data => data && {
        date,
        qfiiTxNetOi: data.qfiiTxNetOi,
      })
      .then(data => data && this.marketStatsRepository.updateMarketStats(data));

    if (updated) Logger.log(`${date} 外資台指期淨未平倉: 已更新`, MarketStatsService.name);
    else Logger.warn(`${date} 外資台指期淨未平倉: 尚無資料或非交易日`, MarketStatsService.name);
  }

  @Cron('5 0 15 * * *')
  async updateQfiiTxoCallsAndPutsNetOiValue(date: string) {
    const updated = await this.taifexScraperService.fetchTaifexInstitutionalInvestorsTxoCallsAndPutsNetOi(date)
      .then(data => data && {
        date,
        qfiiTxoCallsNetOiValue: data.qfiiTxoCallsNetOiValue,
        qfiiTxoPutsNetOiValue: data.qfiiTxoPutsNetOiValue,
      })
      .then(data => data && this.marketStatsRepository.updateMarketStats(data));

    if (updated) Logger.log(`${date} 外資台指選擇權淨未平倉: 已更新`, MarketStatsService.name);
    else Logger.warn(`${date} 外資台指選擇權淨未平倉: 尚無資料或非交易日`, MarketStatsService.name);
  }

  @Cron('10 0 15 * * *')
  async updateLargeTraderTxNetOi(date: string) {
    const updated = await this.taifexScraperService.fetchTaifexLargeTraderTxNetOi(date)
      .then(data => data && {
        date,
        specificTop10TxFrontMonthNetOi: data.frontMonthTxSpecificTop10NetOi,
        specificTop10TxBackMonthsNetOi: data.backMonthsTxSpecificTop10NetOi,
      })
      .then(data => data && this.marketStatsRepository.updateMarketStats(data));

    if (updated) Logger.log(`${date} 十大特法台指期淨未平倉: 已更新`, MarketStatsService.name);
    else Logger.warn(`${date} 十大特法台指期淨未平倉: 尚無資料或非交易日`, MarketStatsService.name);
  }

  @Cron('15 0 15 * * *')
  async updateRetailMtxNetOi(date: string) {
    const updated = await this.taifexScraperService.fetchTaifexRetailMtxNetOi(date)
      .then(data => data && {
        date,
        retailMtxNetOi: data.retailMtxNetOi,
        retailMtxLongShortRatio: data.retailMtxLongShortRatio,
      })
      .then(data => data && this.marketStatsRepository.updateMarketStats(data));

    if (updated) Logger.log(`${date} 散戶小台淨部位: 已更新`, MarketStatsService.name);
    else Logger.warn(`${date} 散戶小台淨部位: 尚無資料或非交易日`, MarketStatsService.name);
  }

  @Cron('20 0 15 * * *')
  async updateTxoPutCallRatio(date: string) {
    const updated = await this.taifexScraperService.fetchTaifexTxoPutCallRatio(date)
      .then(data => data && {
        date,
        txoPutCallRatio: data.txoPutCallRatio,
      })
      .then(data => data && this.marketStatsRepository.updateMarketStats(data));

    if (updated) Logger.log(`${date} 台指選擇權 Put/Call Ratio: 已更新`, MarketStatsService.name);
    else Logger.warn(`${date} 台指選擇權 Put/Call Ratio: 尚無資料或非交易日`, MarketStatsService.name);
  }

  @Cron('0 0 17 * * *')
  async updateUsdTwdRate(date: string) {
    const updated = await this.taifexScraperService.fetchUsdTwdRate(date)
      .then(data => data && {
        date,
        usdtwd: data.usdtwd,
      })
      .then(data => data && this.marketStatsRepository.updateMarketStats(data));

    if (updated) Logger.log(`${date} 美元兌新台幣: 已更新`, MarketStatsService.name);
    else Logger.warn(`${date} 美元兌新台幣: 尚無資料或非交易日`, MarketStatsService.name);
  }

  @Cron('0 0 */1 * * *')
  async updateUsTreasuryYields(date: string) {
    const updated = await this.investingScraperService.fetchUsTreasuryYields(date)
      .then(data => data && {
        date,
        us3m: data.us3m,
        us2y: data.us2y,
        us10y: data.us10y,
      })
      .then(data => data && this.marketStatsRepository.updateMarketStats(data));

    if (updated) Logger.log(`${date} 美國公債殖利率: 已更新`, MarketStatsService.name);
    else Logger.warn(`${date} 美國公債殖利率: 尚無資料或非交易日`, MarketStatsService.name);
  }
}
