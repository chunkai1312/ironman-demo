import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Ticker, TickerSchema } from './ticker.schema';
import { TickerService } from './ticker.service';
import { TickerRepository } from './ticker.repository';
import { ScraperModule } from '../scraper/scraper.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Ticker.name, schema: TickerSchema },
    ]),
    ScraperModule,
  ],
  providers: [TickerService, TickerRepository],
  exports: [TickerService, TickerRepository],
})
export class TickerModule {}
