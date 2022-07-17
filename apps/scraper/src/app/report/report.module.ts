import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { MarketStatsModule } from '../market-stats/market-stats.module';
import { TickerModule } from '../ticker/ticker.module';

@Module({
  imports: [MarketStatsModule, TickerModule],
  providers: [ReportService],
})
export class ReportModule {}
