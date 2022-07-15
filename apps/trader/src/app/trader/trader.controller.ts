import { Controller, Post, Body } from '@nestjs/common';
import { PlaceOrderDto } from './dto/place-order.dto';
import { TraderService } from './trader.service';

@Controller('trader')
export class TraderController {
  constructor(private readonly traderService: TraderService) {}

  @Post('place-order')
  async placeOrder(@Body() placeOrderDto: PlaceOrderDto) {
    return this.traderService.placeOrder(placeOrderDto);
  }
}
