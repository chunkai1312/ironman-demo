import { DateTime } from 'luxon';
import { Logger, Module, OnApplicationBootstrap } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MailerModule } from '@nestjs-modules/mailer';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScraperModule } from './scraper/scraper.module';
import { MarketStatsModule } from './market-stats/market-stats.module';
import { TickerModule } from './ticker/ticker.module';
import { MarketStatsService } from './market-stats/market-stats.service';
import { TickerService } from './ticker/ticker.service';
import { ReportModule } from './report/report.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    ScheduleModule.forRoot(),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          type: 'oauth2',
          user: process.env.GOOGLE_USER,
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          accessToken: process.env.GOOGLE_ACCESS_TOKEN,
          refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        },
      },
      defaults: {
        from: process.env.MAILER_FROM,
        to: process.env.MAILER_TO,
      },
    }),
    ScraperModule,
    MarketStatsModule,
    TickerModule,
    ReportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnApplicationBootstrap {
  constructor(
    private readonly marketStatsService: MarketStatsService,
    private readonly tickerService: TickerService
  ) {}

  async onApplicationBootstrap() {
    if (process.env.SCRAPER_INIT === 'true') {
      Logger.log('正在初始化應用程式...', AppModule.name);

      for (let dt = DateTime.local(), days = 0; days < 31; dt = dt.minus({ day: 1 }), days++) {
        await this.marketStatsService.updateMarketStats(dt.toISODate());
        await this.tickerService.updateTickers(dt.toISODate());
      }

      Logger.log('應用程式初始化完成', AppModule.name);
    }
  }
}
