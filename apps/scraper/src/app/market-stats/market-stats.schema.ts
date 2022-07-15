import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MarketStatsDocument = MarketStats & Document;

@Schema({ timestamps: true })
export class MarketStats {
  @Prop({ required: true })
  date: string;

  @Prop()
  taiexPrice: string;

  @Prop()
  taiexChange: number;

  @Prop()
  taiexChangePercent: string;

  @Prop()
  taiexTradeValue: string;

  @Prop()
  qfiiNetBuySell: number;

  @Prop()
  siteNetBuySell: number;

  @Prop()
  dealersNetBuySell: number;

  @Prop()
  marginPurchase: number;

  @Prop()
  marginPurchaseChange: number;

  @Prop()
  shortSale: number;

  @Prop()
  shortSaleChange: number;

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
