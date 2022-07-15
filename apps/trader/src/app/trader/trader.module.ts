import { Module } from '@nestjs/common';
import { TraderController } from './trader.controller';
import { TraderService } from './trader.service';

@Module({
  controllers: [TraderController],
  providers: [TraderService],
})
export class TraderModule {}
