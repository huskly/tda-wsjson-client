import WsJsonClient from "./client/wsJsonClient";
import { isSuccessfulLoginResponse } from "./client/tdaWsJsonTypes";
import "dotenv/config";

async function run() {
  const accessToken = process.env.ACCESS_TOKEN as string;
  const client = new WsJsonClient(accessToken);
  const loginResponse = await client.connect();
  if (isSuccessfulLoginResponse(loginResponse)) {
    for await (const item of client.quotes(["AAPL"])) {
      console.log(item);
    }
  } else {
    console.log("login failed");
  }
}

run().catch(console.error);
