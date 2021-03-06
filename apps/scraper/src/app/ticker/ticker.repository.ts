import { DateTime } from 'luxon';
import { groupBy, find } from 'lodash';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, QueryOptions, LeanDocument } from 'mongoose';
import { TickerType, Exchange, Market, Index } from '@speculator/common';
import { Ticker, TickerDocument } from './ticker.schema';

@Injectable()
export class TickerRepository {
  constructor(
    @InjectModel(Ticker.name) private readonly tickerModel: Model<TickerDocument>,
  ) {}

  async findTickers(conditions?: FilterQuery<TickerDocument>): Promise<LeanDocument<TickerDocument>[]> {
    return this.tickerModel.find(conditions).lean().exec();
  }

  async updateTicker(ticker: Partial<Ticker>, options?: QueryOptions) {
    const { date, symbol } = ticker;
    return this.tickerModel.updateOne({ date, symbol }, ticker, { ...options, upsert: true });
  }

  async getMoneyFlow(options?: { date?: string, market?: Market }) {
    const date = options?.date || DateTime.local().toISODate();
    const market = options?.market || Market.TSE;

    const results = await this.tickerModel.aggregate([
      { $match: {
          date: { $lte: date },
          type: TickerType.Index,
          market: market || { $ne: null },
          symbol: { $nin: [Index.NonElectronics, Index.NonFinance, Index.NonFinanceNonElectronics] },
        },
      },
      { $project: { _id: 0, __v: 0, createdAt: 0 , updatedAt: 0 } },
      { $group: { _id: '$date', data: { $push: '$$ROOT' } } },
      { $sort: { _id: -1 } },
      { $limit: 2 },
    ]);

    const [ tickers, tickersPrev ] = results.map(doc => doc.data);

    const data = tickers.map(doc => {
      const tradeValuePrev = find(tickersPrev, { symbol: doc.symbol }).tradeValue;
      const tradeWeightPrev = find(tickersPrev, { symbol: doc.symbol }).tradeWeight;
      const tradeValueChange = parseFloat((doc.tradeValue - tradeValuePrev).toPrecision(12));
      const tradeWeightChange = parseFloat((doc.tradeWeight - tradeWeightPrev).toPrecision(12));
      return { ...doc, tradeValuePrev, tradeWeightPrev, tradeValueChange, tradeWeightChange };
    });

    return data;
  }

  async getTopMovers(options?: { date?: string, market?: Market, direction?: 'up' | 'down', top?: number }) {
    const date = options?.date || DateTime.local().toISODate();
    const market = options?.market || Market.TSE;
    const direction = options?.direction || 'up';
    const top = options?.top || 50;

    const results = await this.tickerModel.aggregate([
      { $match: {
          date: { $lte: date },
          type: TickerType.Equity,
          market: market || { $ne: null },
          changePercent: (direction === 'down') ? { $lt: 0 } : { $gt: 0 },
        },
      },
      { $project: { _id: 0, __v: 0, createdAt: 0 , updatedAt: 0 } },
      { $sort: { date: -1, changePercent: (direction === 'down') ? 1 : -1 } },
      { $group: { _id: '$date', data: { $push: '$$ROOT' } } },
      { $sort: { _id: -1 } },
      { $limit: 1 },
    ]);

    const [ tickers ] = results.map(doc => doc.data);
    const data = tickers.slice(0, top);

    return data;
  }

  async getMostActives(options?: { date?: string, market?: Market, trade?: 'volume' | 'value', top?: number }) {
    const date = options?.date || DateTime.local().toISODate();
    const market = options?.market || Market.TSE;
    const trade = options?.trade || 'volume';
    const key = (trade === 'value') ? 'tradeValue' : 'tradeVolume';
    const top = options?.top || 50;

    const results = await this.tickerModel.aggregate([
      { $match: {
          date: { $lte: date },
          type: TickerType.Equity,
          market: market || { $ne: null },
        },
      },
      { $project: { _id: 0, __v: 0, createdAt: 0 , updatedAt: 0 } },
      { $sort: { date: -1, [key]: -1 } },
      { $group: { _id: '$date', data: { $push: '$$ROOT' } } },
      { $sort: { _id: -1 } },
      { $limit: 1 },
    ]);

    const [ tickers ] = results.map(doc => doc.data);
    const data = tickers.slice(0, top);

    return data;
  }

  async getInstiNetBuySell(options?: { date?: string, market?: Market, insti?: 'qfiiNetBuySell' | 'siteNetBuySell' | 'dealerNetBuySell', netBuySell: 'netBuy' | 'netSell', top?: number }) {
    const date = options?.date || DateTime.local().toISODate();
    const market = options?.market || Market.TSE;
    const insti = options?.insti || 'qfiiNetBuySell';
    const netBuySell = options?.netBuySell || 'netBuy';
    const top = options?.top || 50;

    const results = await this.tickerModel.aggregate([
      { $match: {
          date: { $lte: date },
          type: TickerType.Equity,
          market: market || { $ne: null },
          [insti]: (netBuySell === 'netSell') ? { $lt: 0 } : { $gt: 0 },
        },
      },
      { $project: { _id: 0, __v: 0, createdAt: 0 , updatedAt: 0 } },
      { $sort: { date: -1, [insti]: (netBuySell === 'netSell') ? 1 : -1 } },
      { $group: { _id: '$date', data: { $push: '$$ROOT' } } },
      { $sort: { _id: -1 } },
      { $limit: 1 },
    ]);

    const [ tickers ] = results.map(doc => doc.data);
    const data = tickers.slice(0, top);

    return data;
  }
}
