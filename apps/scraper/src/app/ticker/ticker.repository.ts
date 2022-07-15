import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryOptions } from 'mongoose';
import { Ticker, TickerDocument } from './ticker.schema';

@Injectable()
export class TickerRepository {
  constructor(
    @InjectModel(Ticker.name) private readonly tickerModel: Model<TickerDocument>,
  ) {}

  async updateTicker(ticker: Partial<Ticker>, options?: QueryOptions) {
    const { date, symbol } = ticker;
    return this.tickerModel.updateOne({ date, symbol }, ticker, { ...options, upsert: true });
  }
}
