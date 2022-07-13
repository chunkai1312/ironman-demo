import { MonitorType } from '../enums/monitor-type.enum';
import { Monitable, Alert as IAlert } from '../interfaces';

export class Alert implements Monitable {
  id: string;
  name: string;
  symbol: string;
  type: MonitorType;
  value: number;
  alert: IAlert
}
