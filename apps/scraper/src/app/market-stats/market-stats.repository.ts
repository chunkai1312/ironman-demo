import { DateTime } from 'luxon';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryOptions } from 'mongoose';
import { MarketStats, MarketStatsDocument } from './market-stats.schema';

@Injectable()
export class MarketStatsRepository {
  constructor(
    @InjectModel(MarketStats.name) private readonly marketStatsModel: Model<MarketStatsDocument>,
  ) { }

  async updateMarketStats(marketStats: Partial<MarketStats>, options?: QueryOptions) {
    const { date } = marketStats;
    return this.marketStatsModel.updateOne({ date }, marketStats, { ...options, upsert: true });
  }

  async getMarketStats(options?: { days?: number, date?: string }) {
    const date = options?.date || DateTime.local().toISODate();
    const days = options?.days || 30;

    const results = await this.marketStatsModel.aggregate([
      { $match: { date: { $lte: date } } },
      { $project: { _id: 0, __v: 0, createdAt: 0 , updatedAt: 0 } },
      { $sort: { date: -1 } },
      { $limit: days + 1 },
    ]);

    const data = results.map((doc, i) => (i < results.length - 1 ? {
      ...doc,
      taiexChangePercent: doc.taiexPrice && Math.round((doc.taiexChange / (doc.taiexPrice - doc.taiexChange)) * 10000) / 100,
      usdtwdChange: doc.usdtwd && parseFloat((doc.usdtwd - results[i + 1].usdtwd).toPrecision(12)),
      qfiiTxNetOiChange: doc.qfiiTxNetOi && (doc.qfiiTxNetOi - results[i + 1].qfiiTxNetOi),
      qfiiTxoCallsNetOiValueChange: doc.qfiiTxoCallsNetOiValue && (doc.qfiiTxoCallsNetOiValue - results[i + 1].qfiiTxoCallsNetOiValue),
      qfiiTxoPutsNetOiValueChange: doc.qfiiTxoPutsNetOiValue && (doc.qfiiTxoPutsNetOiValue - results[i + 1].qfiiTxoPutsNetOiValue),
      specificTop10TxFrontMonthNetOiChange: doc.specificTop10TxFrontMonthNetOi && (doc.specificTop10TxFrontMonthNetOi - results[i + 1].specificTop10TxFrontMonthNetOi),
      specificTop10TxBackMonthsNetOiChange: doc.specificTop10TxBackMonthsNetOi && (doc.specificTop10TxBackMonthsNetOi - results[i + 1].specificTop10TxBackMonthsNetOi),
      retailMtxNetOiChange: doc.retailMtxNetOi && (doc.retailMtxNetOi - results[i + 1].retailMtxNetOi),
      us10y2ySpread: (doc.us10y && doc.us2y) && parseFloat((doc.us10y - doc.us2y).toPrecision(12)),
      us10y3mSpread: (doc.us10y && doc.us3m) && parseFloat((doc.us10y - doc.us3m).toPrecision(12)),
    } : doc)).slice(0, -1);

    return data;
  }
}
