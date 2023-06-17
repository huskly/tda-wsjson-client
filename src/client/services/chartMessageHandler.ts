import WebSocketApiMessageHandler, {
  newPayload,
} from "./webSocketApiMessageHandler";
import { RawPayloadRequest, RawPayloadResponse } from "../tdaWsJsonTypes";
import { ApiService } from "./apiService";

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
  candles: PriceItem[];
  symbol: string;
};

export type OHLC = {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type PriceItem = { date: Date } & OHLC;

export type ChartRequestParams = {
  symbol: string;
  timeAggregation: string;
  range: string;
  includeExtendedHours: boolean;
};

export default class ChartMessageHandler
  implements WebSocketApiMessageHandler<ChartRequestParams, ChartResponse>
{
  parseResponse(message: RawPayloadResponse): ChartResponse | null {
    const body = message.payload[0].body as RawPayloadResponseChart;
    const isPatchResponse = "patches" in body;
    if (isPatchResponse && body.patches[0].path !== "") {
      // The API sometimes sends a chart patch for incremental changes to the last candle, for example
      // which we don't currently use, so we'll discard that response, eg.:
      // {"payload":[{"header":{"service":"chart","id":"chart-page-chart-1","ver":1,"type":"patch"},
      // "body":{"patches":[
      // {"op":"replace","path":"/candles/volumes/799","value":314130.0},
      // {"op":"replace","path":"/candles/closes/799","value":278.01}]}}]}
      return null;
    }
    const actualResponse = isPatchResponse ? body.patches[0].value : body;
    const { candles, symbol } = actualResponse;
    const data: PriceItem[] = [];
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

  buildRequest({
    symbol,
    timeAggregation,
    range,
    includeExtendedHours,
  }: ChartRequestParams): RawPayloadRequest {
    return newPayload({
      header: { service: "chart", id: "chart-page-chart-1", ver: 1 },
      params: {
        symbol,
        timeAggregation,
        studies: [],
        range,
        extendedHours: includeExtendedHours,
      },
    });
  }

  service: ApiService = "chart";
}
