import WebSocketApiMessageHandler, {
  newPayload,
} from "./webSocketApiMessageHandler";
import { RawPayloadRequest, RawPayloadResponse } from "../tdaWsJsonTypes";
import { compact, isEmpty, isNumber } from "lodash";
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
      ASK_SIZE?: number;
      BID?: number;
      BID_SIZE?: number;
      LAST?: number;
      LAST_SIZE?: number;
      OPEN?: number;
      CLOSE?: number;
      HIGH?: number;
      LOW?: number;
      MARK?: number;
      MARK_CHANGE?: number;
      MARK_PERCENT_CHANGE?: number;
      NET_CHANGE?: number;
      NET_CHANGE_PERCENT?: number;
      VOLUME?: number;
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
  last?: number;
  lastSize?: number;
  open?: number;
  close?: number;
  ask?: number;
  bid?: number;
  high?: number;
  low?: number;
  askSize?: number;
  bidSize?: number;
  netChange?: number;
  netChangePercent?: number;
  mark?: number;
  markChange?: number;
  markChangePercent?: number;
  volume?: number;
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
    const lastSize = values.LAST_SIZE;
    const ask = values.ASK;
    const bid = values.BID;
    const askSize = values.ASK_SIZE;
    const bidSize = values.BID_SIZE;
    const mark = values.MARK;
    const markChange = values.MARK_CHANGE;
    const markChangePercent = values.MARK_PERCENT_CHANGE;
    const low = values.LOW;
    const high = values.HIGH;
    const volume = values.VOLUME;
    const open = values.OPEN;
    const close = values.CLOSE;
    const netChange = values.NET_CHANGE;
    const netChangePercent = values.NET_CHANGE_PERCENT;
    return {
      symbol,
      last,
      lastSize,
      ask,
      bid,
      askSize,
      bidSize,
      mark,
      markChange,
      markChangePercent,
      low,
      high,
      volume,
      open,
      close,
      netChange,
      netChangePercent,
    };
  });
  return { quotes };
}

function parsePatchQuotesDataMessage({
  patches,
}: RawPayloadResponseQuotesPatch): QuotesResponse | null {
  const valueIfPath = (value: number, path: string, suffix: string) =>
    path.endsWith(suffix) ? value : undefined;
  const quotes = patches.flatMap(({ path, value }) => {
    if (path && isNumber(value)) {
      const last = valueIfPath(value, path, "/LAST");
      const lastSize = valueIfPath(value, path, "/LAST_SIZE");
      const mark = valueIfPath(value, path, "/MARK");
      const markChange = valueIfPath(value, path, "/MARK_CHANGE");
      const markChangePercent = valueIfPath(
        value,
        path,
        "/MARK_PERCENT_CHANGE"
      );
      const ask = valueIfPath(value, path, "/ASK");
      const askSize = valueIfPath(value, path, "/ASK_SIZE");
      const bid = valueIfPath(value, path, "/BID");
      const bidSize = valueIfPath(value, path, "/BID_SIZE");
      const netChange = valueIfPath(value, path, "/NET_CHANGE");
      const low = valueIfPath(value, path, "/LOW");
      const high = valueIfPath(value, path, "/HIGH");
      const open = valueIfPath(value, path, "/OPEN");
      const close = valueIfPath(value, path, "/CLOSE");
      const netChangePercent = valueIfPath(value, path, "/NET_CHANGE_PERCENT");
      const symbolIndex = +path.split("/")[2];
      if (
        !isEmpty(
          compact([
            last,
            lastSize,
            ask,
            bid,
            askSize,
            bidSize,
            symbolIndex,
            mark,
            markChange,
            markChangePercent,
            netChange,
            netChangePercent,
            low,
            high,
            open,
            close,
          ])
        )
      ) {
        return [
          {
            last,
            lastSize,
            ask,
            bid,
            askSize,
            bidSize,
            symbolIndex,
            mark,
            markChange,
            markChangePercent,
            netChange,
            netChangePercent,
            low,
            high,
            open,
            close,
          },
        ];
      } else {
        // no relevant data to return, omit
        return [];
      }
    } else {
      const { items } = value as RawPayloadResponseQuotesPatchValue;
      return items.map(
        ({
          symbol,
          values: {
            LAST,
            LAST_SIZE,
            ASK,
            ASK_SIZE,
            BID,
            BID_SIZE,
            OPEN,
            CLOSE,
            HIGH,
            LOW,
            MARK,
            MARK_CHANGE,
            MARK_PERCENT_CHANGE,
            NET_CHANGE,
            NET_CHANGE_PERCENT,
            VOLUME,
          },
        }) =>
          ({
            last: LAST,
            lastSize: LAST_SIZE,
            ask: ASK,
            askSize: ASK_SIZE,
            bid: BID,
            bidSize: BID_SIZE,
            high: HIGH,
            low: LOW,
            open: OPEN,
            close: CLOSE,
            mark: MARK,
            markChange: MARK_CHANGE,
            markChangePercent: MARK_PERCENT_CHANGE,
            netChange: NET_CHANGE,
            netChangePercent: NET_CHANGE_PERCENT,
            volume: VOLUME,
            symbol,
          } as QuotesResponseItem)
      );
    }
  });
  const finalQuotes = compact(quotes);
  return !isEmpty(finalQuotes) ? { quotes: finalQuotes } : null;
}
