import WsJsonClient from "./client/wsJsonClient";
import "dotenv/config";

class TestApp {
  constructor(private readonly client: WsJsonClient) {}

  async chart(symbol: string) {
    console.log(" --- chart() requesting chart data ---");
    const chartRequest = {
      symbol,
      timeAggregation: "DAY",
      range: "YEAR2",
      includeExtendedHours: true,
    };
    for await (const event of this.client.chart(chartRequest)) {
      console.log("chart() : " + JSON.stringify(event));
    }
  }

  async accountNumber(): Promise<string> {
    console.log(" --- accountNumber() requesting account number ---");
    const { defaultAccountCode } = await this.client.userProperties();
    return defaultAccountCode;
  }

  async accountPositions(accountNumber: string) {
    console.log(" --- accountPositions() requesting account positions ---");
    for await (const event of this.client.accountPositions(accountNumber)) {
      console.log("accountPositions() : " + JSON.stringify(event));
    }
  }

  async quotes(symbols: string[]) {
    console.log(" --- quotes() requesting quotes ---");
    for await (const quote of this.client.quotes(symbols)) {
      console.log("quotes() : " + JSON.stringify(quote));
    }
  }
}

async function run() {
  const accessToken = process.env.ACCESS_TOKEN as string;
  const client = new WsJsonClient(accessToken);
  await client.authenticate();
  const app = new TestApp(client);
  await Promise.all([
    // app.chart("UBER"),
    app.quotes(["ABNB", "AAPL"]),
    app.accountNumber().then(app.accountPositions.bind(app)),
  ]);
}

run().catch(console.error);
