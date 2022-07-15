import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScraperModule } from './scraper/scraper.module';
import { MarketStatsModule } from './market-stats/market-stats.module';
import { TickerModule } from './ticker/ticker.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    ScheduleModule.forRoot(),
    ScraperModule,
    MarketStatsModule,
    TickerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
