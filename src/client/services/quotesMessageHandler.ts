import WebSocketApiMessageHandler, {
  newPayload,
} from "./webSocketApiMessageHandler";
import { RawPayloadRequest, RawPayloadResponse } from "../tdaWsJsonTypes";
import { compact, isEmpty } from "lodash";
import { ApiService } from "./apiService";

export type RawPayloadResponseQuotesSnapshot = {
  items: {
    isDelayed: boolean;
    symbol: string;
    values: { [key: string]: any };
  }[];
};

type RawPayloadResponseQuotesPatchValue = {
  items: {
    symbol: string;
    isDelayed: boolean;
    values: {
      ASK?: number;
      ASK_SIZE: number;
      BID: number;
      BID_SIZE: number;
      LAST: number;
      LAST_SIZE: number;
    };
  }[];
};

export type RawPayloadResponseQuotesPatch = {
  patches: {
    op: string;
    path: string;
    value: number | RawPayloadResponseQuotesPatchValue;
  }[];
};

export type QuotesResponse = {
  quotes: Partial<QuotesResponseItem>[];
};

export type QuotesResponseItem = {
  symbol?: string;
  symbolIndex?: number;
  path: string;
  last: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  ask: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  bid: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  askSize: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  bidSize: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

export default class QuotesMessageHandler
  implements WebSocketApiMessageHandler<string[], QuotesResponse | null>
{
  parseResponse({
    payload: [{ header, body }],
  }: RawPayloadResponse): QuotesResponse | null {
    switch (header.type) {
      case "snapshot":
        return parseSnapshotDataMessage(
          body as RawPayloadResponseQuotesSnapshot
        );
      case "patch":
        return parsePatchQuotesDataMessage(
          body as RawPayloadResponseQuotesPatch
        );
      default:
        return null;
    }
  }

  buildRequest(symbols: string[]): RawPayloadRequest {
    return newPayload({
      header: { service: "quotes", id: "generalQuotes", ver: 0 },
      params: {
        account: "COMBINED ACCOUNT",
        symbols,
        refreshRate: 300,
        fields: [
          "MARK",
          "MARK_CHANGE",
          "MARK_PERCENT_CHANGE",
          "NET_CHANGE",
          "NET_CHANGE_PERCENT",
          "BID",
          "ASK",
          "BID_SIZE",
          "ASK_SIZE",
          "VOLUME",
          "OPEN",
          "HIGH",
          "LOW",
          "LAST",
          "LAST_SIZE",
          "CLOSE",
        ],
      },
    });
  }

  service: ApiService = "quotes";
}

function parseSnapshotDataMessage({
  items,
}: RawPayloadResponseQuotesSnapshot): QuotesResponse {
  const quotes = items.map(({ values, symbol }) => {
    const last = values.LAST;
    const ask = values.ASK;
    const bid = values.BID;
    const askSize = values.ASK_SIZE;
    const bidSize = values.BID_SIZE;
    return { symbol, last, ask, bid, askSize, bidSize };
  });
  return { quotes };
}

function parsePatchQuotesDataMessage({
  patches,
}: RawPayloadResponseQuotesPatch): QuotesResponse | null {
  const quotes = patches.flatMap(({ path, value }) => {
    if (path) {
      const last =
        path.endsWith("/LAST") || path.endsWith("/MARK") ? value : null;
      const ask = path.endsWith("/ASK") ? value : null;
      const askSize = path.endsWith("/ASK_SIZE") ? value : null;
      const bid = path.endsWith("/BID") ? value : null;
      const bidSize = path.endsWith("/BID_SIZE") ? value : null;
      const symbolIndex = +path.split("/")[2];
      if (!isEmpty(compact([last, ask, bid, askSize, bidSize, symbolIndex]))) {
        return [{ last, ask, bid, askSize, bidSize, path, symbolIndex }];
      } else {
        // no relevant data to return, omit
        return [];
      }
    } else {
      const { items } = value as RawPayloadResponseQuotesPatchValue;
      return items.map(
        ({ symbol, values: { LAST, ASK, ASK_SIZE, BID, BID_SIZE } }) =>
          ({
            last: LAST,
            ask: ASK,
            askSize: ASK_SIZE,
            bid: BID,
            bidSize: BID_SIZE,
            symbol,
          } as QuotesResponseItem)
      );
    }
  });
  const finalQuotes = compact(quotes);
  return !isEmpty(finalQuotes) ? { quotes: finalQuotes } : null;
}
