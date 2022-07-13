import { MonitorType } from '../enums/monitor-type.enum';

export interface Monitable {
  id: string;
  symbol: string;
  type: MonitorType;
  value: number;
}
