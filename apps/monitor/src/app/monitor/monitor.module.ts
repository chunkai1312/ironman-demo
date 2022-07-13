import { Module } from '@nestjs/common';
import { FugleRealtimeModule } from '@fugle/realtime-nest';
import { MonitorService } from './monitor.service';
import { MonitorController } from './monitor.controller';

@Module({
  imports: [
    FugleRealtimeModule.register({
      apiToken: process.env.FUGLE_REALTIME_API_TOKEN,
    }),
  ],
  controllers: [MonitorController],
  providers: [MonitorService],
})
export class MonitorModule {}
