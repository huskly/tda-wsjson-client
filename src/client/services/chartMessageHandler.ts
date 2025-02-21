import { RawPayloadRequest } from "../tdaWsJsonTypes.js";
import { ApiService } from "./apiService.js";
import WebSocketApiMessageHandler, {
  newPayload,
} from "./webSocketApiMessageHandler.js";

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
  service: "chart";
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
  implements WebSocketApiMessageHandler<ChartRequestParams>
{
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
