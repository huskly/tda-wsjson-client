import WsJsonClientAuth from "./client/wsJsonClientAuth";
import "dotenv/config";
import debug from "debug";
import { CreateAlertRequestParams } from "./client/services/createAlertMessageHandler";
import { OptionQuotesRequestParams } from "./client/services/optionQuotesMessageHandler";
import fetch from "node-fetch";
import { WsJsonClient } from "./client/wsJsonClient";
import RealWsJsonClient from "./client/realWsJsonClient";

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

  async accountPositions(accountNumber: string) {
    logger(" --- accountPositions() requesting account positions ---");
    for await (const event of this.client.accountPositions(accountNumber)) {
      logger("accountPositions() " + JSON.stringify(event));
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
}

async function run() {
  const clientId = process.env.CLIENT_ID;
  const accessToken = process.env.ACCESS_TOKEN;
  const refreshToken = process.env.REFRESH_TOKEN;
  const expiresAt = process.env.TOKEN_EXPIRES_AT;
  if (!clientId || !accessToken || !refreshToken || !expiresAt) {
    throw new Error(
      "Please provide CLIENT_ID, ACCESS_TOKEN, REFRESH_TOKEN and TOKEN_EXPIRES_AT environment variables"
    );
  }
  const token = { accessToken, refreshToken, expiresAt: +expiresAt };
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const authClient = new WsJsonClientAuth(clientId, fetch);
  const { client } = await authClient.authenticateWithRetry(
    token,
    (accessToken) => new RealWsJsonClient(accessToken)
  );
  const app = new TestApp(client);
  await app.placeLimitOrder({ symbol: "ABNB", quantity: 1, limitPrice: 135 });
}

run().catch(console.error);
