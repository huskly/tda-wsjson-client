import WebSocketApiMessageHandler, {
  newPayload,
} from "./webSocketApiMessageHandler";
import { RawPayloadRequest, RawPayloadResponse } from "../tdaWsJsonTypes";
import { ApiService } from "./apiService";

type MarketDepthQuote = {
  name?: string;
  price?: number;
  size?: number;
  index?: number;
};

type MarketDepthPatch = { op: string; path: string; value?: any };

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
    } else if (type === "patch" && "patches" in payload.body) {
      return this.parsePatchResponse(payload.body.patches);
    } else {
      console.warn(
        `Don't know how to handle market depth message with type ${type}`
      );
      return null;
    }
  }

  private parsePatchResponse(
    patches?: MarketDepthPatch[]
  ): MarketDepthResponse | null {
    const patch = patches?.[0];
    if (patch?.op === "replace" && patch?.path === "") {
      const { askQuotes, bidQuotes } =
        patch.value as RawPayloadMarketDepthResponse;
      // if path is an empty string, then this patch behaves just like a snapshot response
      return { service: "market_depth", askQuotes, bidQuotes };
    }
    const bidQuotes: MarketDepthQuote[] = [];
    const askQuotes: MarketDepthQuote[] = [];
    patches
      ?.filter(({ op }) => op === "replace")
      .forEach((patch) => {
        const quote = parseQuote(patch);
        if (patch.path.includes("bidQuotes")) {
          bidQuotes.push(quote);
        } else if (patch.path.includes("askQuotes")) {
          askQuotes.push(quote);
        } else {
          console.warn("Don't know how to handle market depth patch", patch);
        }
      });
    return { service: "market_depth", askQuotes, bidQuotes };
  }

  service: ApiService = "market_depth";
}

function parseQuote(patch: MarketDepthPatch): MarketDepthQuote {
  const { path, value } = patch;
  const pathParts = path.split("/");
  const index = +pathParts[2];
  const prop = pathParts[3];
  const quote: MarketDepthQuote = { index };
  switch (prop) {
    case "size": {
      quote.size = value;
      break;
    }
    case "price": {
      quote.price = value;
      break;
    }
    case "name": {
      quote.name = value;
      break;
    }
    default:
      console.warn("Don't know how to handle market depth patch", patch);
      break;
  }
  return quote;
}
