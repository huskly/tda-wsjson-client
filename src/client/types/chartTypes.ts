export type OHLC = {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type StockPrice = { date: Date } & OHLC;

type RawPayloadResponseChartData = {
  candles: {
    closes: number[];
    highs: number[];
    lows: number[];
    opens: number[];
    timestamps: number[];
    volumes: number[];
  };
  symbol: string;
};

export type RawPayloadResponseChart =
  | RawPayloadResponseChartData
  | {
      patches: {
        op: string;
        path: string;
        value: RawPayloadResponseChartData;
      }[];
    };

export type ChartResponse = {
  candles: StockPrice[];
  symbol: string;
};

export function parseChartResponse(
  response: RawPayloadResponseChart
): ChartResponse | null {
  const isPatchResponse = "patches" in response;
  if (isPatchResponse && response.patches[0].path !== "") {
    // The API sometimes sends a chart patch for incremental changes to the last candle, for example
    // which we don't currently use, so we'll discard that response, eg.:
    // {"payload":[{"header":{"service":"chart","id":"chart-page-chart-1","ver":1,"type":"patch"},
    // "body":{"patches":[
    // {"op":"replace","path":"/candles/volumes/799","value":314130.0},
    // {"op":"replace","path":"/candles/closes/799","value":278.01}]}}]}
    return null;
  }
  const actualResponse = isPatchResponse ? response.patches[0].value : response;
  const { candles, symbol } = actualResponse;
  const data: StockPrice[] = [];
  const { timestamps, opens, closes, highs, lows, volumes } = candles;
  for (let i = 0; i < timestamps.length; i++) {
    data.push({
      date: new Date(timestamps[i]),
      open: opens[i],
      close: closes[i],
      high: highs[i],
      low: lows[i],
      volume: volumes[i],
    });
  }
  return { symbol, candles: data };
}
