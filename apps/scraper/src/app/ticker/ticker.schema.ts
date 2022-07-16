import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TickerDocument = Ticker & Document;

@Schema()
export class Ticker {
  @Prop({ required: true })
  date: string;

  @Prop()
  type: string;

  @Prop()
  exchange: string;

  @Prop()
  market: string;

  @Prop()
  symbol: string;

  @Prop()
  name: string;

  @Prop()
  openPrice: number;

  @Prop()
  highPrice: number;

  @Prop({ type: Number })
  lowPrice: number;

  @Prop()
  closePrice: number;

  @Prop()
  change: number;

  @Prop()
  changePercent: number;

  @Prop()
  tradeVolume: number;

  @Prop()
  tradeValue: number;

  @Prop()
  transaction: number;

  @Prop()
  tradeWeight: number;

  @Prop()
  qfiiNetBuySell: number;

  @Prop()
  siteNetBuySell: number;

  @Prop()
  dealersNetBuySell: number;

  @Prop()
  issuedShares: number;

  @Prop()
  qfiiHoldings: number;

  @Prop()
  marginPurchase: number;

  @Prop()
  marginPurchaseChange: number;

  @Prop()
  shortSale: number;

  @Prop()
  shortSaleChange: number;
}

export const TickerSchema = SchemaFactory.createForClass(Ticker)
  .index({ date: -1, symbol: 1 }, { unique: true });
