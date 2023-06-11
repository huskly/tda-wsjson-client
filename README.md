# TD Ameritrade WsJson API client

This is a node and browser API client for the (undocumented) TDAmeritrade WebSocket API.

🚧 Work in progress 🚧

# Building for Node

```
yarn install
yarn build
```

# Running the sample app

```
cd example
yarn install
yarn link tda-wsjson-client
yarn start
```

# Usage

```typescript
import WsJsonClient from "tda-wsjson-client/wsJsonClient";

const client = new WsJsonClient(accessToken);
await client.authenticate();
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

For more sample usage check out https://github.com/felipecsl/tda-wsjson-client/blob/master/src/app.ts

# Running tests

`yarn test`

# License

MIT
