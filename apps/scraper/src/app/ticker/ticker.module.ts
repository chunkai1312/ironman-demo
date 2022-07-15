import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Ticker, TickerSchema } from './ticker.schema';
import { TickerService } from './ticker.service';
import { ScraperModule } from '../scraper/scraper.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Ticker.name, schema: TickerSchema },
    ]),
    ScraperModule,
  ],
  providers: [TickerService],
})
export class TickerModule {}
