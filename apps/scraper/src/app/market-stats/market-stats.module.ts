import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MarketStats, MarketStatsSchema } from './market-stats.schema';
import { MarketStatsService } from './market-stats.service';
import { MarketStatsRepository } from './market-stats.repository';
import { ScraperModule } from '../scraper/scraper.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MarketStats.name, schema: MarketStatsSchema },
    ]),
    ScraperModule,
  ],
  providers: [MarketStatsService, MarketStatsRepository],
  exports: [MarketStatsService, MarketStatsRepository],
})
export class MarketStatsModule {}
