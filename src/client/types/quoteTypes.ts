import { RawPayloadResponse } from "../tdaWsJsonTypes";
import { compact, isEmpty } from "lodash";

export type RawPayloadResponseQuotesSnapshot = {
  items: {
    isDelayed: boolean;
    symbol: string;
    values: { [key: string]: any };
  }[];
};

export type RawPayloadResponseQuotesPatchValue = {
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
  symbol: string;
  path: string;
  last: any;
  ask: any;
  bid: any;
  askSize: any;
  bidSize: any;
};

function parsePatchQuotesDataMessage(
  { patches }: RawPayloadResponseQuotesPatch,
  symbols: string[]
): QuotesResponse | null {
  const quotes = patches.flatMap(({ path, value }) => {
    if (path) {
      const last =
        path.endsWith("/LAST") || path.endsWith("/MARK") ? value : null;
      const ask = path.endsWith("/ASK") ? value : null;
      const askSize = path.endsWith("/ASK_SIZE") ? value : null;
      const bid = path.endsWith("/BID") ? value : null;
      const bidSize = path.endsWith("/BID_SIZE") ? value : null;
      const symbolIndex = path.split("/")[2];
      const symbol = symbols[+symbolIndex];
      if (!isEmpty(compact([last, ask, bid, askSize, bidSize, symbol]))) {
        return [
          {
            last,
            ask,
            bid,
            askSize,
            bidSize,
            path,
            symbol,
          } as QuotesResponseItem,
        ];
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
  return { quotes: compact(quotes) };
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

export function parseQuotesResponse(
  { payload: [{ header, body }] }: RawPayloadResponse,
  symbols: string[]
): QuotesResponse | null {
  switch (header.type) {
    case "snapshot":
      return parseSnapshotDataMessage(body as RawPayloadResponseQuotesSnapshot);
    case "patch":
      return parsePatchQuotesDataMessage(
        body as RawPayloadResponseQuotesPatch,
        symbols
      );
    default:
      return null;
  }
}
