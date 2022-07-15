import { Module } from '@nestjs/common';
import { FugleTradeModule } from '@fugle/trade-nest';
import { LineNotifyModule } from 'nest-line-notify';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TraderModule } from './trader/trader.module';

@Module({
  imports: [
    FugleTradeModule.forRoot({
      config: {
        apiUrl: process.env.FUGLE_TRADE_API_URL,
        certPath: process.env.FUGLE_TRADE_CERT_PATH,
        apiKey: process.env.FUGLE_TRADE_API_KEY,
        apiSecret: process.env.FUGLE_TRADE_API_SECRET,
        aid: process.env.FUGLE_TRADE_AID,
        password: process.env.FUGLE_TRADE_PASSWORD,
        certPass: process.env.FUGLE_TRADE_CERT_PASS,
      },
    }),
    LineNotifyModule.forRoot({
      accessToken: process.env.LINE_NOTIFY_ACCESS_TOKEN,
    }),
    TraderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
