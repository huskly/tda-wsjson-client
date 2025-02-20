# TD Ameritrade WsJson API client

This is a node and browser API client for the (undocumented) Schwab WebSocket API.

🚧 Work in progress 🚧

# Prerequisites

- Node 16+

# Building for Node

```
yarn install
yarn build
```

# Running the example app

```
yarn install
node dist/example/testApp.js
```

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

For more sample usage check out https://github.com/huskly/tda-wsjson-client/blob/master/src/testApp.ts and
https://github.com/huskly/tda-wsjson-client/blob/master/example/src/App.tsx

# Running tests

`yarn test`

# License

MIT
