import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MarketStatsDocument = MarketStats & Document;

@Schema({ timestamps: true })
export class MarketStats {
  @Prop({ required: true })
  date: string;

  @Prop()
  taiexPrice: number;

  @Prop()
  taiexChange: number;

  @Prop()
  taiexTradeValue: number;

  @Prop()
  qfiiNetBuySell: number;

  @Prop()
  siteNetBuySell: number;

  @Prop()
  dealersNetBuySell: number;

  @Prop()
  margin: number;

  @Prop()
  marginChange: number;

  @Prop()
  short: number;

  @Prop()
  shortChange: number;

  @Prop()
  qfiiTxNetOi: number;

  @Prop()
  qfiiTxoCallsNetOi: number;

  @Prop()
  qfiiTxoCallsNetOiValue: number;

  @Prop()
  qfiiTxoPutsNetOi: number;

  @Prop()
  qfiiTxoPutsNetOiValue: number;

  @Prop()
  specificTop10TxFrontMonthNetOi: number;

  @Prop()
  specificTop10TxBackMonthsNetOi: number;

  @Prop()
  retailMtxNetOi: number;

  @Prop()
  retailMtxLongShortRatio: number;

  @Prop()
  txoPutCallRatio: number;

  @Prop()
  usdtwd: number;

  @Prop()
  us3m: number;

  @Prop()
  us2y: number;

  @Prop()
  us10y: number;
}

export const MarketStatsSchema = SchemaFactory.createForClass(MarketStats)
  .index({ date: -1 }, { unique: true });
