import { MonitorType } from "../enums/monitor-type.enum";
import { Monitable, Order as IOrder } from '../interfaces';

export class Order implements Monitable {
  id: string;
  name: string;
  symbol: string;
  type: MonitorType;
  value: number;
  order: IOrder;
}
