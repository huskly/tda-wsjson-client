import WsJsonClient from "./client/wsJsonClient";
import "dotenv/config";
import { isSuccessfulLoginResponse } from "./client/messageTypeHelpers";

async function run() {
  const accessToken = process.env.ACCESS_TOKEN as string;
  const client = new WsJsonClient(accessToken);
  const loginResponse = await client.connect();
  if (isSuccessfulLoginResponse(loginResponse)) {
    const chartRequest = {
      symbol: "UBER",
      timeAggregation: "DAY",
      range: "YEAR2",
      includeExtendedHours: true,
    };
    console.log("requesting chart data");
    for await (const event of client.chart(chartRequest)) {
      console.log(event);
    }
  } else {
    console.log("login failed");
  }
}

run().catch(console.error);
