import { MonitorType } from '../enums/monitor-type.enum';
import { Monitable, Alert } from '../interfaces';

export class CreateAlertDto implements Monitable {
  id: string;
  symbol: string;
  type: MonitorType;
  value: number;
  alert: Alert;
}
