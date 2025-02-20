import debug from "debug";
import "dotenv/config";
import RealWsJsonClient from "../client/realWsJsonClient.js";
import { CreateAlertRequestParams } from "../client/services/createAlertMessageHandler.js";
import { OptionQuotesRequestParams } from "../client/services/optionQuotesMessageHandler.js";
import { WsJsonClient } from "../client/wsJsonClient.js";
import WsJsonClientAuth from "../client/wsJsonClientAuth.js";
import MarketDepthStateUpdater from "./marketDepthStateUpdater.js";
import { getAuthCode } from "./browserOauth.js";

const logger = debug("testapp");

class TestApp {
  constructor(private readonly client: WsJsonClient) {}

  async chart(symbol: string) {
    logger(" --- chart() requesting chart data ---");
    const chartRequest = {
      symbol,
      timeAggregation: "DAY",
      range: "YEAR2",
      includeExtendedHours: true,
    };
    for await (const event of this.client.chart(chartRequest)) {
      logger("chart() " + JSON.stringify(event));
    }
  }

  async accountNumber(): Promise<string> {
    logger(" --- accountNumber() requesting account number ---");
    const { defaultAccountCode } = await this.client.userProperties();
    return defaultAccountCode;
  }

  async accountPositions() {
    const accountNumber = await this.accountNumber();
    logger(" --- accountPositions() requesting account positions ---");
    for await (const event of this.client.accountPositions(accountNumber)) {
      logger("accountPositions() %O", event);
    }
  }

  async quotes(symbols: string[]) {
    logger(" --- quotes() requesting quotes ---");
    for await (const quote of this.client.quotes(symbols)) {
      logger(
        "quotes() %O",
        quote.quotes.map((q) => {
          if (!q.symbol && q.symbolIndex) {
            q.symbol = symbols[q.symbolIndex];
            delete q.symbolIndex;
          }
          return q;
        })
      );
    }
  }

  async cancelOrder(orderId: number) {
    logger(" --- cancelOrder() cancelling order ---");
    const cancelResponse = await this.client.cancelOrder(orderId);
    logger(cancelResponse);
  }

  async createAlert(request: CreateAlertRequestParams) {
    logger(" --- createAlert() creating alert ---");
    const result = await this.client.createAlert(request);
    logger("createAlert() " + JSON.stringify(result));
  }

  async cancelAlert(alertId: number) {
    logger(" --- cancelAlert() cancelling alert ---");
    const cancelResponse = await this.client.cancelAlert(alertId);
    logger(cancelResponse);
  }

  async instrumentSearch(query: string) {
    logger(" --- instrumentSearch() searching for instrument ---");
    const searchResults = await this.client.searchInstruments(query);
    logger("instrumentSearch() %O", searchResults);
  }

  async optionChain(symbol: string) {
    logger(" --- optionChain() requesting option chain ---");
    const optionChain = await this.client.optionChain(symbol);
    logger("optionChain() %O", optionChain);
  }

  async optionChainQuotes(symbol: string) {
    logger(" --- optionChainQuotes() requesting option chain quotes ---");
    const events = this.client.optionChainQuotes(symbol);
    for await (const event of events) {
      logger("optionChainQuotes() " + JSON.stringify(event));
    }
  }

  async optionChainDetails(symbol: string, seriesNames: string[]) {
    logger(" --- optionChainDetails() requesting option chain details ---");
    const optionChainDetails = await this.client.optionChainDetails({
      symbol,
      seriesNames,
    });
    logger("optionChainDetails() " + JSON.stringify(optionChainDetails));
  }

  async optionQuotes(params: OptionQuotesRequestParams) {
    logger(" --- optionQuotes() requesting option quotes ---");
    for await (const optionQuotes of this.client.optionQuotes(params)) {
      logger("optionQuotes() %O", optionQuotes);
    }
  }

  async workingOrders() {
    const accountNumber = await this.accountNumber();
    logger(" --- workingOrders() requesting working orders ---");
    for await (const event of this.client.workingOrders(accountNumber)) {
      logger("workingOrders() %O", event);
    }
  }

  async placeLimitOrder({
    symbol,
    quantity,
    limitPrice,
  }: {
    symbol: string;
    quantity: number;
    limitPrice: number;
  }) {
    const accountNumber = await this.accountNumber();
    logger(" --- placeLimitOrder() placing limit order ---");
    const placeOrderResponse = await this.client.placeOrder({
      accountNumber,
      quantity,
      symbol,
      limitPrice,
    });
    logger("placeLimitOrder() %O", placeOrderResponse);
  }

  async marketDepth(symbol: string) {
    const stateUpdater = new MarketDepthStateUpdater();
    logger(` --- marketDepth() requesting market depth for ${symbol} ---`);
    for await (const message of this.client.marketDepth(symbol)) {
      logger("message %O", message);
      stateUpdater.handleMessage(message);
      logger("ask quotes: %O", stateUpdater.askQuotes);
      logger("bid quotes: %O", stateUpdater.bidQuotes);
    }
  }

  async getWatchlist(watchlistId: number) {
    logger(" --- getWatchlist() get watchlist ---");
    const watchlist = await this.client.watchlist(watchlistId);
    logger("getWatchlist() %O", watchlist);
  }
}

async function run() {
  const authCode = await getAuthCode();
  const authClient = new WsJsonClientAuth(() => new RealWsJsonClient());
  const client = await authClient.authenticateWithRetry(authCode);
  const app = new TestApp(client);
  await Promise.all([
    app.quotes(["ABNB", "UBER"]),
    app.accountPositions(),
    app.optionChain("TSLA"),
    app.optionChainQuotes("AAPL"),
  ]);
}

run().catch(console.error);
