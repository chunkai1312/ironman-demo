import * as numeral from 'numeral';
import * as ExcelJS from 'exceljs';
import { DateTime } from 'luxon';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Market } from '@speculator/common';
import { TickerRepository } from '../ticker/ticker.repository';
import { MarketStatsRepository } from '../market-stats/market-stats.repository';
import { ForegroundColor } from './enums/foreground-color.enum';
import { getFontColorByNetChange, getMarketName, getSectorName } from './utils'

@Injectable()
export class ReportService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly tickerRepository: TickerRepository,
    private readonly marketStatsRepository: MarketStatsRepository,
  ) {}

  @Cron('0 0 22 * * *')
  async sendReport(options?: { date: string }) {
    const dt = options?.date ? DateTime.fromISO(options.date) : DateTime.local();
    const content = await this.export({ date: dt.toISODate() });
    const date = dt.toFormat('yyyyMMdd');
    const subject = `${date} 盤後籌碼`;
    const filename = `${date}-盤後籌碼.xlsx`;
    const attachments = [{ filename, content }];

    await this.sendEmail({ subject, attachments });
  }

  async sendEmail(options: ISendMailOptions) {
    this.mailerService.sendMail(options)
      .then((success) => Logger.log(`"${options.subject}" 已寄出`, ReportService.name))
      .catch((err) => Logger.error(err.message, err.stack, ReportService.name));
  }

  async export(options: { date: string }) {
    const workbook = new ExcelJS.Workbook();

    await this.addMarketInfoSheet(workbook, options);
    await this.addMoneyFlowSheet(workbook, { ...options, market: Market.TSE });
    await this.addMoneyFlowSheet(workbook, { ...options, market: Market.OTC });
    await this.addMostActivesSheet(workbook, { ...options, market: Market.TSE });
    await this.addMostActivesSheet(workbook, { ...options, market: Market.OTC });
    await this.addTopMoversSheet(workbook, { ...options, market: Market.TSE });
    await this.addTopMoversSheet(workbook, { ...options, market: Market.OTC });
    await this.addInstiNetBuySellSheet(workbook, { ...options, market: Market.TSE });
    await this.addInstiNetBuySellSheet(workbook, { ...options, market: Market.OTC });

    return workbook.xlsx.writeBuffer();
  }

  async addMarketInfoSheet(workbook: ExcelJS.Workbook, options: { date: string }) {
    const worksheet = workbook.addWorksheet();

    worksheet.columns = [
      { header: '日期', key: 'date', width: 10, style: { alignment: { vertical: 'middle', horizontal: 'center' } } },
      { header: '加權指數', key: 'taiexPrice', width: 15, style: { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.Taiex } } } },
      { header: '漲跌', key: 'taiexChange', width: 12.5, style: { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.Taiex } } } },
      { header: '漲跌幅', key: 'taiexChangePercent', width: 12.5, style: { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.Taiex } } } },
      { header: '成交量(億)', key: 'taiexTradeValue', width: 15, style: { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.Taiex } } } },
      { header: '外資\r\n買賣超(億)', key: 'qfiiNetBuySell', width: 15, style: { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.NetBuySell } } } },
      { header: '投信\r\n買賣超(億)', key: 'siteNetBuySell', width: 15, style: { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.NetBuySell } } } },
      { header: '自營商\r\n買賣超(億)', key: 'dealersNetBuySell', width: 15, style: { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.NetBuySell } } } },
      { header: '融資\r\n餘額(億)', key: 'margin', width: 15, style: { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.MarginTransaction } } } },
      { header: '融資\r\n餘額增減(億)', key: 'marginChange', width: 15, style: { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.MarginTransaction } } } },
      { header: '融券\r\n餘額(張)', key: 'short', width: 15, style: { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.MarginTransaction } } } },
      { header: '融券\r\n餘額增減(張)', key: 'shortChange', width: 15, style: { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.MarginTransaction } } } },
      { header: '外資台指期\r\nOI淨口數', key: 'qfiiTxNetOi', width: 17.5, style: { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.QfiiFutures } } } },
      { header: '外資台指期\r\nOI淨口數增減', key: 'qfiiTxNetOiChange', width: 17.5, style: { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.QfiiFutures } } } },
      { header: '外資台指買權\r\nOI淨金額(億)', key: 'qfiiTxoCallsNetOiValue', width: 17.5, style: { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.QfiiCallsAndPuts } } } },
      { header: '外資台指買權\r\nOI淨金額增減(億)', key: 'qfiiTxoCallsNetOiValueChange', width: 17.5, style: { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.QfiiCallsAndPuts } } } },
      { header: '外資台指賣權\r\nOI淨金額(億)', key: 'qfiiTxoPutsNetOiValue', width: 17.5, style: { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.QfiiCallsAndPuts } } } },
      { header: '外資台指賣權\r\nOI淨金額增減(億)', key: 'qfiiTxoPutsNetOiValueChange', width: 17.5, style: { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.QfiiCallsAndPuts } } } },
      { header: '十大特法台指\r\n近月OI淨口數', key: 'specificTop10TxFrontMonthNetOi', width: 20, style: { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.Top10Traders } } } },
      { header: '十大特法台指\r\n近月OI淨口數增減', key: 'specificTop10TxFrontMonthNetOiChange', width: 20, style: { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.Top10Traders } } } },
      { header: '十大特法台指\r\n遠月OI淨口數', key: 'specificTop10TxBackMonthsNetOi', width: 20, style: { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.Top10Traders } } } },
      { header: '十大特法台指\r\n遠月OI淨口數增減', key: 'specificTop10TxBackMonthsNetOiChange', width: 20, style: { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.Top10Traders } } } },
      { header: '散戶小台\r\nOI淨口數', key: 'retailMtxNetOi', width: 15, style: { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.RetailInvestors } } } },
      { header: '散戶小台\r\nOI淨口數增減', key: 'retailMtxNetOiChange', width: 15, style: { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.RetailInvestors } } } },
      { header: '散戶多空比', key: 'retailMtxLongShortRatio', width: 15, style: { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.RetailInvestors } } } },
      { header: '台指選擇權\r\nPut/Call Ratio', key: 'txoPutCallRatio', width: 15, style: { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.PcRatio } } } },
      { header: '美元/新台幣', key: 'usdtwd', width: 12.5, style: { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.UsdTwd } } } },
      { header: '新台幣升貶', key: 'usdtwdChange', width: 12.5, style: { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.UsdTwd } } } },
    ];

    const data = await this.marketStatsRepository.getMarketStats(options);

    data.forEach(row => {
      row = {
        ...row,
        taiexChangePercent: row.taiexChangePercent && numeral(row.taiexChangePercent).divide(100).value(),
        taiexTradeValue: row.taiexTradeValue && numeral(row.taiexTradeValue).divide(100000000).value(),
        qfiiNetBuySell: row.qfiiNetBuySell && numeral(row.qfiiNetBuySell).divide(100000000).value(),
        siteNetBuySell: row.siteNetBuySell && numeral(row.siteNetBuySell).divide(100000000).value(),
        dealersNetBuySell: row.dealersNetBuySell && numeral(row.dealersNetBuySell).divide(100000000).value(),
        margin: row.margin && numeral(row.margin).divide(100000).value(),
        marginChange: row.marginChange && numeral(row.marginChange).divide(100000).value(),
        qfiiTxoCallsNetOiValue: row.qfiiTxoCallsNetOiValue && numeral(row.qfiiTxoCallsNetOiValue).divide(100000).value(),
        qfiiTxoCallsNetOiValueChange: row.qfiiTxoCallsNetOiValueChange && numeral(row.qfiiTxoCallsNetOiValueChange).divide(100000).value(),
        qfiiTxoPutsNetOiValue: row.qfiiTxoPutsNetOiValue && numeral(row.qfiiTxoPutsNetOiValue).divide(100000).value(),
        qfiiTxoPutsNetOiValueChange: row.qfiiTxoPutsNetOiValueChange && numeral(row.qfiiTxoPutsNetOiValueChange).divide(100000).value(),
        usdtwdChange: row.usdtwdChange * -1,
      };

      const dataRow = worksheet.addRow(row);
      dataRow.getCell('date').style = { alignment: { horizontal: 'center' } };
      dataRow.getCell('taiexPrice').font = { color: { argb: getFontColorByNetChange(row.taiexPrice) } };
      dataRow.getCell('taiexChange').style = { font: { color: { argb: getFontColorByNetChange(row.taiexChange) } } };
      dataRow.getCell('taiexChangePercent').style = { numFmt: '#0.00%', font: { color: { argb: getFontColorByNetChange(row.taiexChangePercent) } } };
      dataRow.getCell('taiexTradeValue').style = { numFmt: '#,##0.00' };
      dataRow.getCell('qfiiNetBuySell').style = { numFmt: '#,##0.00', font: { color: { argb: getFontColorByNetChange(row.qfiiNetBuySell) } } };
      dataRow.getCell('siteNetBuySell').style = { numFmt: '#,##0.00', font: { color: { argb: getFontColorByNetChange(row.siteNetBuySell) } } };
      dataRow.getCell('dealersNetBuySell').style = { numFmt: '#,##0.00', font: { color: { argb: getFontColorByNetChange(row.dealersNetBuySell) } } };
      dataRow.getCell('margin').style = { numFmt: '#,##0.00' };
      dataRow.getCell('marginChange').style = { numFmt: '#,##0.00', font: { color: { argb: getFontColorByNetChange(row.marginPurchaseChange) } } };
      dataRow.getCell('short').style = { numFmt: '#,##0' };
      dataRow.getCell('shortChange').style = { numFmt: '#,##0', font: { color: { argb: getFontColorByNetChange(row.shortSaleChange) } } };
      dataRow.getCell('qfiiTxNetOi').style = { numFmt: '#,##0', font: { color: { argb: getFontColorByNetChange(row.qfiiTxNetOi) } } };
      dataRow.getCell('qfiiTxNetOiChange').style = { numFmt: '#,##0', font: { color: { argb: getFontColorByNetChange(row.qfiiTxNetOiChange) } } };
      dataRow.getCell('qfiiTxoCallsNetOiValue').style = { numFmt: '#,##0.00', font: { color: { argb: getFontColorByNetChange(row.qfiiTxoCallsNetOiValue) } } };
      dataRow.getCell('qfiiTxoCallsNetOiValueChange').style = { numFmt: '#,##0.00', font: { color: { argb: getFontColorByNetChange(row.qfiiTxoCallsNetOiValueChange) } } };
      dataRow.getCell('qfiiTxoPutsNetOiValue').style = { numFmt: '#,##0.00', font: { color: { argb: getFontColorByNetChange(row.qfiiTxoPutsNetOiValue) } } };
      dataRow.getCell('qfiiTxoPutsNetOiValueChange').style = { numFmt: '#,##0.00', font: { color: { argb: getFontColorByNetChange(row.qfiiTxoPutsNetOiValueChange) } } };
      dataRow.getCell('specificTop10TxFrontMonthNetOi').style = { numFmt: '#,##0', font: { color: { argb: getFontColorByNetChange(row.specificTop10TxFrontMonthNetOi) } } };
      dataRow.getCell('specificTop10TxFrontMonthNetOiChange').style = { numFmt: '#,##0', font: { color: { argb: getFontColorByNetChange(row.specificTop10TxFrontMonthNetOiChange) } } };
      dataRow.getCell('specificTop10TxBackMonthsNetOi').style = { numFmt: '#,##0', font: { color: { argb: getFontColorByNetChange(row.specificTop10TxBackMonthsNetOi) } } };
      dataRow.getCell('specificTop10TxBackMonthsNetOiChange').style = { numFmt: '#,##0', font: { color: { argb: getFontColorByNetChange(row.specificTop10TxBackMonthsNetOiChange) } } };
      dataRow.getCell('retailMtxNetOi').style = { numFmt: '#,##0', font: { color: { argb: getFontColorByNetChange(row.retailMtxNetOi) } } };
      dataRow.getCell('retailMtxNetOiChange').style = { numFmt: '#,##0', font: { color: { argb: getFontColorByNetChange(row.retailMtxNetOiChange) } } };
      dataRow.getCell('retailMtxLongShortRatio').style = { numFmt: '#0.00%', font: { color: { argb: getFontColorByNetChange(row.retailMtxLongShortRatio) } } };
      dataRow.getCell('txoPutCallRatio').style = { numFmt: '#0.00%' };
      dataRow.getCell('usdtwd').style = { numFmt: '0.000', font: { color: { argb: getFontColorByNetChange(row.usdtwdChange * -1) } }  };
      dataRow.getCell('usdtwdChange').style = { numFmt: '0.000', font: { color: { argb: getFontColorByNetChange(row.usdtwdChange * -1) } }  };
      dataRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } };
      dataRow.height = 20;
    });

    const date = data[0].date.replace(/-/g, '');
    worksheet.name = `${date} 大盤籌碼`;

    return workbook;
  }

  async addMoneyFlowSheet(workbook: ExcelJS.Workbook, options: { date: string, market: Market }) {
    const worksheet = workbook.addWorksheet();

    worksheet.columns = [
      { header: '指數(類股)', key: 'name', width: 17.5, style: { alignment: { horizontal: 'left' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: 'ffe0b2' } } } },
      { header: '指數', key: 'closePrice', width: 12.5, style: { alignment: { horizontal: 'right' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: 'ffe0b2' } } } },
      { header: '漲跌', key: 'change', width: 12.5, style: { alignment: { horizontal: 'right' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: 'ffe0b2' } } } },
      { header: '漲跌幅', key: 'changePercent', width: 12.5, style: { alignment: { horizontal: 'right' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: 'ffe0b2' } } } },
      { header: '成交金額(億)', key: 'tradeValue', width: 12.5, style: { alignment: { horizontal: 'right' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: 'ffe0b2' } } } },
      { header: '昨日金額(億)', key: 'tradeValuePrev', width: 12.5, style: { alignment: { horizontal: 'right' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: 'ffe0b2' } } } },
      { header: '金額差(億)', key: 'tradeValueChange', width: 12.5, style: { alignment: { horizontal: 'right' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: 'ffe0b2' } } } },
      { header: '成交比重', key: 'tradeWeight', width: 12.5, style: { alignment: { horizontal: 'right' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: 'ffe0b2' } } } },
      { header: '昨日比重', key: 'tradeWeightPrev', width: 12.5, style: { alignment: { horizontal: 'right' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: 'ffe0b2' } } } },
      { header: '比重差', key: 'tradeWeightChange', width: 12.5, style: { alignment: { horizontal: 'right' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: 'ffe0b2' } } } },
    ];

    const data = await this.tickerRepository.getMoneyFlow(options);

    data.forEach(row => {
      row = {
        ...row,
        name: getSectorName(row.name),
        changePercent: row.changePercent && numeral(row.changePercent).divide(100).value(),
        tradeValue: row.tradeValue && numeral(row.tradeValue).divide(100000000).value(),
        tradeValuePrev: row.tradeValuePrev && numeral(row.tradeValuePrev).divide(100000000).value(),
        tradeValueChange: row.tradeValueChange && numeral(row.tradeValueChange).divide(100000000).value(),
        tradeWeight: row.tradeWeight && numeral(row.tradeWeight).divide(100).value(),
        tradeWeightPrev: row.tradeWeightPrev && numeral(row.tradeWeightPrev).divide(100).value(),
        tradeWeightChange: row.tradeWeightChange && numeral(row.tradeWeightChange).divide(100).value(),
      };

      const dataRow = worksheet.addRow(row);
      dataRow.getCell('closePrice').style = { numFmt: '##0.00', font: { color: { argb: getFontColorByNetChange(row.change) } } };
      dataRow.getCell('change').style = { numFmt: '##0.00', font: { color: { argb: getFontColorByNetChange(row.change) } } };
      dataRow.getCell('changePercent').style = { numFmt: '#0.00%', font: { color: { argb: getFontColorByNetChange(row.change) } } };
      dataRow.getCell('tradeValue').style = { numFmt: '#,##0.00' };
      dataRow.getCell('tradeValuePrev').style = { numFmt: '#,##0.00' };
      dataRow.getCell('tradeValueChange').style = { numFmt: '#,##0.00', font: { color: { argb: getFontColorByNetChange(row.tradeValueChange) } } };
      dataRow.getCell('tradeWeight').style = { numFmt: '#0.00%' };
      dataRow.getCell('tradeWeightPrev').style = { numFmt: '#0.00%' };
      dataRow.getCell('tradeWeightChange').style = { numFmt: '#0.00%', font: { color: { argb: getFontColorByNetChange(row.tradeWeightChange) } } };
      dataRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } };
      dataRow.height = 20;
    });

    const market = getMarketName(options.market);
    worksheet.name = `${market}資金流向`;
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).height = 20;

    return workbook;
  }

  async addTopMoversSheet(workbook: ExcelJS.Workbook, options: { date: string, market: Market }) {
    const worksheet = workbook.addWorksheet();

    worksheet.columns = [
      { header: '代號', key: 'gainerSymbol', width: 10 },
      { header: '股票', key: 'gainerName', width: 15 },
      { header: '股價', key: 'gainerClosePrice', width: 8, style: { alignment: { horizontal: 'right' } } },
      { header: '漲跌', key: 'gainerChange', width: 8, style: { alignment: { horizontal: 'right' } } },
      { header: '漲跌幅', key: 'gainerChangePercent', width: 8, style: { alignment: { horizontal: 'right' } } },
      { header: '成交量(張)', key: 'gainerTradeVolume', width: 12, style: { alignment: { horizontal: 'right' } } },
      { header: '', key: '', width: 8 },
      { header: '代號', key: 'loserSymbol', width: 10 },
      { header: '股票', key: 'loserName', width: 15 },
      { header: '股價', key: 'loserClosePrice', width: 8, style: { alignment: { horizontal: 'right' } } },
      { header: '漲跌', key: 'loserChange', width: 8, style: { alignment: { horizontal: 'right' } } },
      { header: '漲跌幅', key: 'loserChangePercent', width: 8, style: { alignment: { horizontal: 'right' } } },
      { header: '成交量(張)', key: 'loserTradeVolume', width: 12, style: { alignment: { horizontal: 'right' } } },
    ];

    const gainers = await this.tickerRepository.getTopMovers({ ...options, direction: 'up' });
    const losers = await this.tickerRepository.getTopMovers({ ...options, direction: 'down' });
    const length = Math.max(gainers.length, losers.length);

    Array(length).fill({}).forEach((row, i) => {
      row = {
        gainerSymbol: gainers[i]?.symbol,
        gainerName: gainers[i]?.name,
        gainerClosePrice: gainers[i]?.closePrice,
        gainerChange: gainers[i]?.change,
        gainerChangePercent: gainers[i]?.changePercent && numeral(gainers[i].changePercent).divide(100).value(),
        gainerTradeVolume: gainers[i]?.tradeVolume && numeral(gainers[i].tradeVolume).divide(1000).value(),
        loserSymbol: losers[i]?.symbol,
        loserName: losers[i]?.name,
        loserClosePrice: losers[i]?.closePrice,
        loserChange: losers[i]?.change,
        loserChangePercent: losers[i]?.changePercent && numeral(losers[i].changePercent).divide(100).value(),
        loserTradeVolume: losers[i]?.tradeVolume && numeral(losers[i].tradeVolume).divide(1000).value(),
      }

      const dataRow = worksheet.addRow(row);
      dataRow.getCell('gainerClosePrice').style = { numFmt: '#0.00', font: { color: { argb: getFontColorByNetChange(gainers[i]?.change) } } };
      dataRow.getCell('gainerChange').style = { numFmt: '#0.00', font: { color: { argb: getFontColorByNetChange(gainers[i]?.change) } } };
      dataRow.getCell('gainerChangePercent').style = { numFmt: '#0.00%', font: { color: { argb: getFontColorByNetChange(gainers[i]?.change) } } };
      dataRow.getCell('gainerTradeVolume').style = { numFmt: '#,##0' };
      dataRow.getCell('loserClosePrice').style = { numFmt: '#0.00', font: { color: { argb: getFontColorByNetChange(losers[i]?.change) } } };
      dataRow.getCell('loserChange').style = { numFmt: '#0.00', font: { color: { argb: getFontColorByNetChange(losers[i]?.change) } } };
      dataRow.getCell('loserChangePercent').style = { numFmt: '#0.00%', font: { color: { argb: getFontColorByNetChange(losers[i]?.change) } } };
      dataRow.getCell('loserTradeVolume').style = { numFmt: '#,##0' };
      dataRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } };
      dataRow.height = 20;
    });

    const headerRow = worksheet.insertRow(1, ['漲幅排行', '', '', '', '', '', '', '跌幅排行', '', '', '', '', '']);
    const titleGainersCell = headerRow.getCell(1);
    const titleLosersCell = headerRow.getCell(8);
    titleGainersCell.style = { alignment: { horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: ForegroundColor.Title } } };
    titleLosersCell.style = { alignment: { horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: ForegroundColor.Title } } };
    worksheet.mergeCells(+titleGainersCell.row, +titleGainersCell.col, +titleGainersCell.row, +titleGainersCell.col + 5)
    worksheet.mergeCells(+titleLosersCell.row, +titleLosersCell.col, +titleLosersCell.row, +titleLosersCell.col + 5)
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 20;

    const market = getMarketName(options.market);
    worksheet.name = `${market}漲跌幅排行`;
    worksheet.getRow(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } };

    return workbook;
  }

  async addMostActivesSheet(workbook: ExcelJS.Workbook, options: { date: string, market: Market }) {
    const worksheet = workbook.addWorksheet();

    worksheet.columns = [
      { header: '代號', key: 'volumeSymbol', width: 10 },
      { header: '股票', key: 'volumeName', width: 15 },
      { header: '股價', key: 'volumeClosePrice', width: 8, style: { alignment: { horizontal: 'right' } } },
      { header: '漲跌', key: 'volumeChange', width: 8, style: { alignment: { horizontal: 'right' } } },
      { header: '漲跌幅', key: 'volumeChangePercent', width: 8, style: { alignment: { horizontal: 'right' } } },
      { header: '成交量(張)', key: 'volumeTradeVolume', width: 12, style: { alignment: { horizontal: 'right' } } },
      { header: '', key: '', width: 8 },
      { header: '代號', key: 'valueSymbol', width: 10 },
      { header: '股票', key: 'valueName', width: 15 },
      { header: '股價', key: 'valueClosePrice', width: 8, style: { alignment: { horizontal: 'right' } } },
      { header: '漲跌', key: 'valueChange', width: 8, style: { alignment: { horizontal: 'right' } } },
      { header: '漲跌幅', key: 'valueChangePercent', width: 8, style: { alignment: { horizontal: 'right' } } },
      { header: '成交值(億)', key: 'valueTradeValue', width: 12, style: { alignment: { horizontal: 'right' } } },
    ];

    const mostActivesByVolume = await this.tickerRepository.getMostActives({ ...options, trade: 'volume' });
    const mostActivesByValue = await this.tickerRepository.getMostActives({ ...options, trade: 'value' });
    const length = mostActivesByVolume.length

    Array(length).fill({}).forEach((row, i) => {
      row = {
        volumeSymbol: mostActivesByVolume[i]?.symbol,
        volumeName: mostActivesByVolume[i]?.name,
        volumeClosePrice: mostActivesByVolume[i]?.closePrice,
        volumeChange: mostActivesByVolume[i]?.change,
        volumeChangePercent: mostActivesByVolume[i]?.changePercent && numeral(mostActivesByVolume[i].changePercent).divide(100).value(),
        volumeTradeVolume: mostActivesByVolume[i]?.tradeVolume && numeral(mostActivesByVolume[i].tradeVolume).divide(1000).value(),
        valueSymbol: mostActivesByValue[i]?.symbol,
        valueName: mostActivesByValue[i]?.name,
        valueClosePrice: mostActivesByValue[i]?.closePrice,
        valueChange: mostActivesByValue[i]?.change,
        valueChangePercent: mostActivesByValue[i]?.changePercent && numeral(mostActivesByValue[i].changePercent).divide(100).value(),
        valueTradeValue: mostActivesByValue[i]?.tradeValue && numeral(mostActivesByValue[i].tradeValue).divide(100000000).value(),
      }

      const dataRow = worksheet.addRow(row);
      dataRow.getCell('volumeClosePrice').style = { numFmt: '#0.00', font: { color: { argb: getFontColorByNetChange(mostActivesByVolume[i]?.change) } } };
      dataRow.getCell('volumeChange').style = { numFmt: '#0.00', font: { color: { argb: getFontColorByNetChange(mostActivesByVolume[i]?.change) } } };
      dataRow.getCell('volumeChangePercent').style = { numFmt: '#0.00%', font: { color: { argb: getFontColorByNetChange(mostActivesByVolume[i]?.change) } } };
      dataRow.getCell('volumeTradeVolume').style = { numFmt: '#,##0' };
      dataRow.getCell('valueClosePrice').style = { numFmt: '#0.00', font: { color: { argb: getFontColorByNetChange(mostActivesByValue[i]?.change) } } };
      dataRow.getCell('valueChange').style = { numFmt: '#0.00', font: { color: { argb: getFontColorByNetChange(mostActivesByValue[i]?.change) } } };
      dataRow.getCell('valueChangePercent').style = { numFmt: '#0.00%', font: { color: { argb: getFontColorByNetChange(mostActivesByValue[i]?.change) } } };
      dataRow.getCell('valueTradeValue').style = { numFmt: '#,##0.00' };
      dataRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } };
      dataRow.height = 20;
    });

    const headerRow = worksheet.insertRow(1, ['成交量排行', '', '', '', '', '', '', '成交值排行', '', '', '', '', '']);
    const titleMostActivesByVolumeCell = headerRow.getCell(1);
    const titleMostActivesByValueCell = headerRow.getCell(8);
    titleMostActivesByVolumeCell.style = { alignment: { horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: ForegroundColor.Title } } };
    titleMostActivesByValueCell.style = { alignment: { horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: ForegroundColor.Title } } };
    worksheet.mergeCells(+titleMostActivesByVolumeCell.row, +titleMostActivesByVolumeCell.col, +titleMostActivesByVolumeCell.row, +titleMostActivesByVolumeCell.col + 5)
    worksheet.mergeCells(+titleMostActivesByValueCell.row, +titleMostActivesByValueCell.col, +titleMostActivesByValueCell.row, +titleMostActivesByValueCell.col + 5)
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 20;

    const market = getMarketName(options.market);
    worksheet.name = `${market}成交量值排行`;
    worksheet.getRow(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } };

    return workbook;
  }

  async addInstiNetBuySellSheet(workbook: ExcelJS.Workbook, options: { date: string, market: Market }) {
    const worksheet = workbook.addWorksheet();

    worksheet.columns = [
      { header: '代號', key: 'qfiiNetBuySymbol', width: 10 },
      { header: '股票', key: 'qfiiNetBuyName', width: 15 },
      { header: '張數', key: 'qfiiNetBuyVolume', width: 10, style: { alignment: { horizontal: 'right' } } },
      { header: '股價', key: 'qfiiNetBuyClosePrice', width: 8, style: { alignment: { horizontal: 'right' } } },
      { header: '漲跌幅', key: 'qfiiNetBuyChangePercent', width: 8, style: { alignment: { horizontal: 'right' } } },
      { header: '成交量(張)', key: 'qfiiNetBuyTotalVolume', width: 12, style: { alignment: { horizontal: 'right' } } },
      { header: '', key: '', width: 8 },
      { header: '代號', key: 'qfiiNetSellSymbol', width: 10 },
      { header: '股票', key: 'qfiiNetSellName', width: 15 },
      { header: '張數', key: 'qfiiNetSellVolume', width: 10, style: { alignment: { horizontal: 'right' } } },
      { header: '股價', key: 'qfiiNetSellClosePrice', width: 8, style: { alignment: { horizontal: 'right' } } },
      { header: '漲跌幅', key: 'qfiiNetSellChangePercent', width: 8, style: { alignment: { horizontal: 'right' } } },
      { header: '成交量(張)', key: 'qfiiNetSellTotalVolume', width: 12, style: { alignment: { horizontal: 'right' } } },
      { header: '', key: '', width: 8 },
      { header: '代號', key: 'siteNetBuySymbol', width: 10 },
      { header: '股票', key: 'siteNetBuyName', width: 15 },
      { header: '張數', key: 'siteNetBuyVolume', width: 10, style: { alignment: { horizontal: 'right' } } },
      { header: '股價', key: 'siteNetBuyClosePrice', width: 8, style: { alignment: { horizontal: 'right' } } },
      { header: '漲跌幅', key: 'siteNetBuyChangePercent', width: 8, style: { alignment: { horizontal: 'right' } } },
      { header: '成交量(張)', key: 'siteNetBuyTotalVolume', width: 12, style: { alignment: { horizontal: 'right' } } },
      { header: '', key: '', width: 8 },
      { header: '代號', key: 'siteNetSellSymbol', width: 10 },
      { header: '股票', key: 'siteNetSellName', width: 15 },
      { header: '張數', key: 'siteNetSellVolume', width: 10, style: { alignment: { horizontal: 'right' } } },
      { header: '股價', key: 'siteNetSellClosePrice', width: 8, style: { alignment: { horizontal: 'right' } } },
      { header: '漲跌幅', key: 'siteNetSellChangePercent', width: 8, style: { alignment: { horizontal: 'right' } } },
      { header: '成交量(張)', key: 'siteNetSellTotalVolume', width: 12, style: { alignment: { horizontal: 'right' } } },
    ];

    const qfiiNetBuyList = await this.tickerRepository.getInstiNetBuySell({ ...options, insti: 'qfiiNetBuySell', netBuySell: 'netBuy' });
    const qfiiNetSellList = await this.tickerRepository.getInstiNetBuySell({ ...options, insti: 'qfiiNetBuySell', netBuySell: 'netSell' });
    const siteNetBuyList = await this.tickerRepository.getInstiNetBuySell({ ...options, insti: 'siteNetBuySell', netBuySell: 'netBuy' });
    const siteNetSellList = await this.tickerRepository.getInstiNetBuySell({ ...options, insti: 'siteNetBuySell', netBuySell: 'netSell' });

    const length = Math.max(qfiiNetBuyList.length, qfiiNetSellList.length, siteNetBuyList.length, siteNetSellList.length);

    Array(length).fill({}).forEach((row, i) => {
      row = {
        qfiiNetBuySymbol: qfiiNetBuyList[i]?.symbol,
        qfiiNetBuyName: qfiiNetBuyList[i]?.name,
        qfiiNetBuyVolume: qfiiNetBuyList[i]?.qfiiNetBuySell && numeral(qfiiNetBuyList[i].qfiiNetBuySell).divide(1000).value(),
        qfiiNetBuyClosePrice: qfiiNetBuyList[i]?.closePrice,
        qfiiNetBuyChangePercent: qfiiNetBuyList[i]?.changePercent && numeral(qfiiNetBuyList[i].changePercent).divide(100).value(),
        qfiiNetBuyTotalVolume: qfiiNetBuyList[i]?.tradeVolume && numeral(qfiiNetBuyList[i].tradeVolume).divide(1000).value(),
        qfiiNetSellSymbol: qfiiNetSellList[i]?.symbol,
        qfiiNetSellName: qfiiNetSellList[i]?.name,
        qfiiNetSellVolume: qfiiNetSellList[i]?.qfiiNetBuySell && numeral(qfiiNetSellList[i].qfiiNetBuySell).divide(1000).value(),
        qfiiNetSellClosePrice: qfiiNetSellList[i]?.closePrice,
        qfiiNetSellChangePercent: qfiiNetSellList[i]?.changePercent && numeral(qfiiNetSellList[i].changePercent).divide(100).value(),
        qfiiNetSellTotalVolume: qfiiNetSellList[i]?.tradeVolume && numeral(qfiiNetSellList[i].tradeVolume).divide(1000).value(),
        siteNetBuySymbol: siteNetBuyList[i]?.symbol,
        siteNetBuyName: siteNetBuyList[i]?.name,
        siteNetBuyVolume: siteNetBuyList[i]?.qfiiNetBuySell && numeral(siteNetBuyList[i].siteNetBuySell).divide(1000).value(),
        siteNetBuyClosePrice: siteNetBuyList[i]?.closePrice,
        siteNetBuyChangePercent: siteNetBuyList[i]?.changePercent && numeral(siteNetBuyList[i].changePercent).divide(100).value(),
        siteNetBuyTotalVolume: siteNetBuyList[i]?.tradeVolume && numeral(siteNetBuyList[i].tradeVolume).divide(1000).value(),
        siteNetSellSymbol: siteNetSellList[i]?.symbol,
        siteNetSellName: siteNetSellList[i]?.name,
        siteNetSellVolume: siteNetSellList[i]?.qfiiNetBuySell && numeral(siteNetSellList[i].siteNetBuySell).divide(1000).value(),
        siteNetSellClosePrice: siteNetSellList[i]?.closePrice,
        siteNetSellChangePercent: siteNetSellList[i]?.changePercent && numeral(siteNetSellList[i].changePercent).divide(100).value(),
        siteNetSellTotalVolume: siteNetSellList[i]?.tradeVolume && numeral(siteNetSellList[i].tradeVolume).divide(1000).value(),
      }

      const dataRow = worksheet.addRow(row);
      dataRow.getCell('qfiiNetBuyVolume').style = { numFmt: '#,##0' };
      dataRow.getCell('qfiiNetBuyClosePrice').style = { numFmt: '#0.00', font: { color: { argb: getFontColorByNetChange(qfiiNetBuyList[i]?.change) } } };
      dataRow.getCell('qfiiNetBuyChangePercent').style = { numFmt: '#0.00%', font: { color: { argb: getFontColorByNetChange(qfiiNetBuyList[i]?.change) } } };
      dataRow.getCell('qfiiNetBuyTotalVolume').style = { numFmt: '#,##0' };
      dataRow.getCell('qfiiNetSellVolume').style = { numFmt: '#,##0' };
      dataRow.getCell('qfiiNetSellClosePrice').style = { numFmt: '#0.00', font: { color: { argb: getFontColorByNetChange(qfiiNetSellList[i]?.change) } } };
      dataRow.getCell('qfiiNetSellChangePercent').style = { numFmt: '#0.00%', font: { color: { argb: getFontColorByNetChange(qfiiNetSellList[i]?.change) } } };
      dataRow.getCell('qfiiNetSellTotalVolume').style = { numFmt: '#,##0' };
      dataRow.getCell('siteNetBuyVolume').style = { numFmt: '#,##0' };
      dataRow.getCell('siteNetBuyClosePrice').style = { numFmt: '#0.00', font: { color: { argb: getFontColorByNetChange(siteNetBuyList[i]?.change) } } };
      dataRow.getCell('siteNetBuyChangePercent').style = { numFmt: '#0.00%', font: { color: { argb: getFontColorByNetChange(siteNetBuyList[i]?.change) } } };
      dataRow.getCell('siteNetBuyTotalVolume').style = { numFmt: '#,##0' };
      dataRow.getCell('siteNetSellVolume').style = { numFmt: '#,##0' };
      dataRow.getCell('siteNetSellClosePrice').style = { numFmt: '#0.00', font: { color: { argb: getFontColorByNetChange(siteNetSellList[i]?.change) } } };
      dataRow.getCell('siteNetSellChangePercent').style = { numFmt: '#0.00%', font: { color: { argb: getFontColorByNetChange(siteNetSellList[i]?.change) } } };
      dataRow.getCell('siteNetSellTotalVolume').style = { numFmt: '#,##0' };
      dataRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } };
      dataRow.height = 20;
    });

    const headerRow = worksheet.insertRow(1, ['外資買超', '', '', '', '', '', '', '外資賣超', '', '', '', '', '', '', '投信買超', '', '', '', '', '', '', '投信賣超', '', '', '', '', '']);
    const titleqfiiNetBuyCell = headerRow.getCell(1);
    const titleqfiiNetSellCell = headerRow.getCell(8);
    const titleSticNetBuyCell = headerRow.getCell(15);
    const titleSiteNetSellCell = headerRow.getCell(22);
    titleqfiiNetBuyCell.style = { alignment: { horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.Title } } };
    titleqfiiNetSellCell.style = { alignment: { horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.Title } } };
    titleSticNetBuyCell.style = { alignment: { horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.Title } } };
    titleSiteNetSellCell.style = { alignment: { horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.Title } } };
    worksheet.mergeCells(+titleqfiiNetBuyCell.row, +titleqfiiNetBuyCell.col, +titleqfiiNetBuyCell.row, +titleqfiiNetBuyCell.col + 5)
    worksheet.mergeCells(+titleqfiiNetSellCell.row, +titleqfiiNetSellCell.col, +titleqfiiNetSellCell.row, +titleqfiiNetSellCell.col + 5)
    worksheet.mergeCells(+titleSticNetBuyCell.row, +titleSticNetBuyCell.col, +titleSticNetBuyCell.row, +titleSticNetBuyCell.col + 5)
    worksheet.mergeCells(+titleSiteNetSellCell.row, +titleSiteNetSellCell.col, +titleSiteNetSellCell.row, +titleSiteNetSellCell.col + 5)
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 20;

    const market = getMarketName(options.market);
    worksheet.name = `${market}外資投信買賣超排行`;
    worksheet.getRow(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } };
  }
}
