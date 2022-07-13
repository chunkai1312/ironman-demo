import { Controller, Post, Body } from '@nestjs/common';
import { MonitorService } from './monitor.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('monitor')
export class MonitorController {
  constructor(private readonly monitorService: MonitorService) {}

  @Post('alerts')
  async createMonitor(@Body() createAlertDto: CreateAlertDto) {
    return this.monitorService.createAlert(createAlertDto);
  }

  @Post('orders')
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.monitorService.createOrder(createOrderDto);
  }
}
