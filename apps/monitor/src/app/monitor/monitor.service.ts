import { Redis } from 'ioredis';
import { template } from 'lodash';
import { DateTime } from 'luxon';
import { BadRequestException, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { WebSocketClient } from '@fugle/realtime';
import { InjectWebSocketClient } from '@fugle/realtime-nest';
import { InjectLineNotify, LineNotify } from 'nest-line-notify';
import { CreateAlertDto } from './dto/create-alert.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { Monitable } from './interfaces';
import { Alert, Order } from './models'

@Injectable()
export class MonitorService implements OnApplicationBootstrap {
  private readonly sockets = new Map<string, WebSocket>();

  constructor(
    @InjectRedis() private readonly redis: Redis,
    @InjectWebSocketClient() private readonly client: WebSocketClient,
    @InjectLineNotify() private readonly lineNotify: LineNotify,
  ) {}

  async onApplicationBootstrap() {
    this.redis.smembers('monitors:')
      .then(members => members.forEach(symbol => this.createSocket(symbol)))
  }

  async createAlert(createAlertDto: CreateAlertDto) {
    const id = `alerts:${Date.now()}`;
    const monitable = { id, ...createAlertDto };
    await this.createMonitor(monitable);
    return monitable;
  }

  async createOrder(createOrderDto: CreateOrderDto) {
    const id = `orders:${Date.now()}`;
    const monitable = { id, ...createOrderDto };
    await this.createMonitor(monitable);
    return monitable;
  }

  private async createMonitor(monitable: Monitable) {
    const { symbol, type, value } = monitable;
    const key = `monitors:${symbol}:${type}`;

    await this.redis.multi()
      .set(monitable.id, JSON.stringify(monitable))
      .zadd(key, value, monitable.id)
      .exec();

    if (!this.sockets.has(symbol)) {
      if (this.sockets.size === 5) {
        throw new BadRequestException('monitor limit reached');
      }
      await this.redis.sadd('monitors:', symbol);
      this.createSocket(symbol);
    }
  }

  private createSocket(symbol: string) {
    const socket = this.client.intraday.quote({ symbolId: symbol });

    socket.onmessage = (message) => {
      const res = JSON.parse(message.data) ;

      if (res.data.info.type !== 'EQUITY') return;
      if (!res.data.quote.trade) return;

      this.checkMatches(symbol, res.data.quote);
    };

    this.sockets.set(symbol, socket);
  }

  private async checkMatches(symbol: string, quote: any) {
    const { price } = quote.trade;

    const matches = await Promise.all([
      this.redis.zrangebyscore(`monitors:${symbol}:price:gt`, '-inf', price),
      this.redis.zrangebyscore(`monitors:${symbol}:price:lt`, price, '+inf'),
    ]).then(members => [].concat.apply([], members));

    if (!matches.length) return;

    const data = await this.redis.mget(matches)
      .then(results => results.map(data => JSON.parse(data)));

    data.forEach(monitable => {
      if (monitable.alert) this.handleAlert(monitable, quote);
    });
  }

  async handleAlert(monitable: Alert, quote: any) {
    const { id, symbol, type, alert } = monitable;

    const compiled = template(alert.message)({
      price: quote.trade.price,
      volume: quote.total.tradeVolume,
    });
    const time = DateTime.fromISO(quote.trade.at).toFormat('yyyy/MM/dd HH:mm:ss');
    const message = `\n<<${alert.name}>>\n${compiled}\n${time}`;

    await this.lineNotify.send({ message });

    await this.redis.multi()
      .zrem(`monitors:${symbol}:${type}`, id)
      .del(id)
      .exec();
  }

  async handleOrder(monitable: Order, quote: any) {
    const { id, symbol, type, order } = monitable;

    await this.redis.multi()
      .zrem(`monitors:${symbol}:${type}`, id)
      .del(id)
      .exec();
  }
}
