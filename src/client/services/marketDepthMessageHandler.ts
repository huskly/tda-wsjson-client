import WebSocketApiMessageHandler, {
  newPayload,
} from "./webSocketApiMessageHandler";
import { RawPayloadRequest, RawPayloadResponse } from "../tdaWsJsonTypes";
import { ApiService } from "./apiService";

type MarketDepthQuote = {
  name: string;
  price: number;
  size: number;
};

export type RawPayloadMarketDepthResponse = {
  askQuotes: MarketDepthQuote[];
  bidQuotes: MarketDepthQuote[];
};

export type MarketDepthResponse = {
  service: "market_depth";
  askQuotes: MarketDepthQuote[];
  bidQuotes: MarketDepthQuote[];
};

export default class MarketDepthMessageHandler
  implements WebSocketApiMessageHandler<string, MarketDepthResponse | null>
{
  buildRequest(symbol: string): RawPayloadRequest {
    return newPayload({
      header: {
        service: "market_depth",
        id: "marketDepth-trade-page-chart",
        ver: 0,
      },
      params: { symbol },
    });
  }

  parseResponse(message: RawPayloadResponse): MarketDepthResponse | null {
    const [payload] = message.payload;
    const type = payload.header.type;
    if (type === "snapshot") {
      const body = payload.body as RawPayloadMarketDepthResponse;
      const { askQuotes, bidQuotes } = body;
      return { service: "market_depth", askQuotes, bidQuotes };
    } else {
      console.warn(
        `Don't know how to handle market depth message with type ${type}`
      );
      return null;
    }
  }

  service: ApiService = "market_depth";
}
