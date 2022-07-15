export class PlaceOrderDto {
  stockNo: string;
  buySell: string;
  price?: number
  quantity: number;
  apCode: string;
  priceFlag: string;
  bsFlag: string;
  trade: string;
}
