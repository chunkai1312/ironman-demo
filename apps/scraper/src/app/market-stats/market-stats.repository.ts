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
}
