import { DateTime } from 'luxon';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryOptions } from 'mongoose';
import { MarketStats, MarketStatsDocument } from './market-stats.schema';

@Injectable()
export class MarketStatsRepository {
  constructor(
    @InjectModel(MarketStats.name) private readonly marketStatsModel: Model<MarketStatsDocument>,
  ) {}

  async updateMarketStats(marketStats: Partial<MarketStats>, options?: QueryOptions) {
    const { date } = marketStats;
    return this.marketStatsModel.updateOne({ date }, marketStats, { ...options, upsert: true });
  }

  async getMarketStats(options?: { days?: number, date?: string }) {
    const date = options?.date || DateTime.local().toISODate();
    const days = options?.days || 30;

    const results = await this.marketStatsModel
      .find({ date: { $lte: date } })
      .limit(days + 1)
      .sort({ date: -1 })
      .lean()
      .exec();

    const data = results.map((row, i) => (i < results.length - 1 ? {
      taiexChangePercent: row.taiexPrice && Math.round((row.taiexChange / (row.taiexPrice - row.taiexChange)) * 10000) / 100,
      usdtwdChange: row.usdtwd && parseFloat((row.usdtwd - results[i + 1].usdtwd).toPrecision(12)),
      qfiiTxNetOiChange: row.qfiiTxNetOi && (row.qfiiTxNetOi - results[i + 1].qfiiTxNetOi),
      qfiiTxoCallsNetOiValueChange: row.qfiiTxoCallsNetOiValue && (row.qfiiTxoCallsNetOiValue - results[i + 1].qfiiTxoCallsNetOiValue),
      qfiiTxoPutsNetOiValueChange: row.qfiiTxoPutsNetOiValue && (row.qfiiTxoPutsNetOiValue - results[i + 1].qfiiTxoPutsNetOiValue),
      top10TxFrontMonthNetOiChange: row.specificTop10TxFrontMonthNetOi && (row.specificTop10TxFrontMonthNetOi - results[i + 1].specificTop10TxFrontMonthNetOi),
      top10TxBackMonthsNetOiChange: row.specificTop10TxBackMonthsNetOi && (row.specificTop10TxBackMonthsNetOi - results[i + 1].specificTop10TxBackMonthsNetOi),
      retailMtxNetOiChange: row.retailMtxNetOi && (row.retailMtxNetOi - results[i + 1].retailMtxNetOi),
      us10y2ySpread: (row.us10y && row.us2y) && parseFloat((row.us10y - row.us2y).toPrecision(12)),
      us10y3mSpread: (row.us10y && row.us3m) && parseFloat((row.us10y - row.us3m).toPrecision(12)),
      ...row,
    } : row)).slice(0, -1);

    return data;
  }
}
