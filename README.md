# thinkorswim WsJson API client

This is a node and browser API client for the (undocumented) thinkorswim WebSocket API.

🚧 Work in progress 🚧

# Prerequisites

- Node 18+

# Building for Node

```
yarn install
yarn build
```

# Running the example app

```
yarn install
# if you already have an access token and refresh token
DEBUG_DEPTH=5 DEBUG=* TOS_ACCESS_TOKEN=<access_token> TOS_REFRESH_TOKEN=<refresh_token>  node dist/example/testApp.js
# if you don't have an access token and refresh token, you can use your username and password
# this will launch a browser to authenticate and then save the access token and refresh token to .env
DEBUG_DEPTH=5 DEBUG=* TOS_USERNAME=<username> TOS_PASSWORD=<password> node dist/example/testApp.js
```

## Authentication flow

There seems to be currently two ways to authenticate:

1. From scratch with username and password:
   a. Send a message with the `login/schwab` service including the `authCode` obtained from the browser oauth flow at `trade.thinkorswim.com`;
   b. This will return a `token` and `refreshToken` which should be saved for future use;
   c. The `authCode` is single use and cannot be used again once exchanged for a token.
2. From a previously obtained `token`
   a. Send a message with the `login` service including the `token` returned from the `login/schwab` response message (step 1 above).
   b. This will return the same `token`, weirdly, and a `refreshToken`, which should be saved for future use
   c. The token is valid for 24 hours.

# Supported APIs

- ✅ Authentication via access token
- ✅ Quotes
- ✅ Price History (chart)
- ✅ Account positions
- ✅ Place & submit order
- ✅ Cancel order
- ✅ User properties
- ✅ Create alert
- ✅ Cancel alert
- ✅ Instrument search
- ✅ Option chains
- ✅ Alert lookup
- ✅ Option chain details
- ✅ Option chain quotes
- ✅ Option quotes
- ✅ Order events
- ✅ Market depth
- ✅ Get watchlist

# Not yet implemented

- ❌ Instrument order events
- ❌ Alert subscription
- ❌ And many more 😀

# Usage

```typescript
import WsJsonClient from "tda-wsjson-client/wsJsonClient";

const client = new WsJsonClient();
await client.authenticate(accessToken);
console.log(loginResponse);
const chartRequest = {
  symbol: "UBER",
  timeAggregation: "DAY",
  range: "YEAR2",
  includeExtendedHours: true,
};
for await (const event of client.chart(chartRequest)) {
  console.log(event);
}
```

For more sample usage check out https://github.com/huskly/tos-wsjson-client/blob/master/src/example/testApp.ts

# Running tests

`yarn test`

# License

MIT
