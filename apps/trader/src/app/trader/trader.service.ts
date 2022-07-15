import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { FugleTrade, Order, OrderPayload } from '@fugle/trade';
import { InjectLineNotify, LineNotify } from 'nest-line-notify';
import { InjectFugleTrade, Streamer } from '@fugle/trade-nest';
import { PlaceOrderDto } from './dto/place-order.dto';

@Injectable()
export class TraderService {
  constructor(
    @InjectFugleTrade() private readonly fugle: FugleTrade,
    @InjectLineNotify() private readonly lineNotify: LineNotify,
  ) {}

  async placeOrder(placeOrderDto: PlaceOrderDto) {
    const payload = placeOrderDto as OrderPayload;
    const order = new Order(payload);

    try {
      this.fugle.placeOrder(order);
    } catch(err) {
      throw new InternalServerErrorException();
    }

    return { status: 'ok' };
  }

  @Streamer.OnConnect()
  async onConnect() {
    console.log('open')
    // streamer connected

    const order = new Order({
      buySell: Order.Side.Buy,
      price: 25.00,
      stockNo: '2884',
      quantity: 1,
      apCode: Order.ApCode.Common,
      priceFlag: Order.PriceFlag.Limit,
      bsFlag: Order.BsFlag.ROD,
      trade: Order.Trade.Cash,
    });

    // place order
    this.fugle.placeOrder(order);
  }

  @Streamer.OnDisconnect()
  async onDisconnect() {
    // streamer disconnected
  }

  @Streamer.OnOrder()
  async onOrder(data) {
    // const msg = JSON.parse(data);
    // const value = JSON.parse(msg['data']['$value']);

    // const date = data.$value.

    console.log('OnOrder', data)
    // receive order confirmation

    // const symbol =

    // this.lineNotify.send()
  }

  @Streamer.OnTrade()
  async onTrade(data) {
    console.log('OnTrade', data)
    // receive execution report
  }

  @Streamer.OnMessage()
  async onMessage(data) {
    // console.log('OnMessage', data)
    // receive execution report
  }

  @Streamer.OnError()
  async onError(err) {
    // handle error
  }
}


// Kind: 'ACK',
// WorkDate: '20220712',
// RetDate: '20220712',
// RetTime: '012443ZZZ',
// OrgRequestNo: '',
// RequestNo: '',
// OrdType: '2',
// OrdNo: '1',
// OrgPreOrdNo: '',
// StkNo: '2884',
// ApCode: '1',
// BuySell: 'B',
// Trade: '0',
// PriceFlag: '4',
// OdPrice: '',
// OrgQty: '1',
// MatQty: '0',
// CelQty: '0',
// CelType: '1',
// ErrCode: '00000000',
// ErrMsg: '',
// Act: 'O',
// BfQty: '0',
// AfQty: '0',
// BsFlag: 'R'
