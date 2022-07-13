import { MonitorType } from '../enums/monitor-type.enum';
import { Monitable, Order } from '../interfaces';

export class CreateOrderDto implements Monitable {
  id: string;
  symbol: string;
  type: MonitorType;
  value: number;
  order: Order;
}
