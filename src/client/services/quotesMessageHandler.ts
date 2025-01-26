import WebSocketApiMessageHandler, {
  newPayload,
} from "./webSocketApiMessageHandler.js";
import { RawPayloadRequest, RawPayloadResponse } from "../tdaWsJsonTypes.js";
import { compact, isEmpty, isNil, isNumber, omitBy } from "lodash-es";
import { ApiService } from "./apiService.js";

const ALL_FIELDS = [
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
] as const;

type FieldType = (typeof ALL_FIELDS)[number];

export type RawPayloadResponseQuotesItem = {
  symbol?: string;
  isDelayed?: boolean;
  values: {
    [key in FieldType]?: number;
  };
};

export type RawPayloadResponseQuotesSnapshot = {
  items: RawPayloadResponseQuotesItem[];
};

type RawPayloadResponseQuotesPatchValue = {
  items: RawPayloadResponseQuotesItem[];
};

export type RawPayloadResponseQuotesPatch = {
  patches: {
    op: string;
    path: string;
    value:
      | number
      | RawPayloadResponseQuotesPatchValue
      | RawPayloadResponseQuotesItem;
  }[];
};

export type QuotesResponse = {
  quotes: Partial<QuotesResponseItem>[];
  service: "quotes";
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
        fields: ALL_FIELDS,
      },
    });
  }

  service: ApiService = "quotes";
}

function parseSnapshotDataMessage({
  items,
}: RawPayloadResponseQuotesSnapshot): QuotesResponse {
  const quotes = items.map(parseQuoteItem);
  return { quotes, service: "quotes" };
}

function parseQuoteItem({
  symbol,
  values,
}: RawPayloadResponseQuotesItem): QuotesResponseItem {
  return {
    last: values.LAST,
    lastSize: values.LAST_SIZE,
    ask: values.ASK,
    askSize: values.ASK_SIZE,
    bid: values.BID,
    bidSize: values.BID_SIZE,
    high: values.HIGH,
    low: values.LOW,
    open: values.OPEN,
    close: values.CLOSE,
    mark: values.MARK,
    markChange: values.MARK_CHANGE,
    markChangePercent: values.MARK_PERCENT_CHANGE,
    netChange: values.NET_CHANGE,
    netChangePercent: values.NET_CHANGE_PERCENT,
    volume: values.VOLUME,
    symbol,
  };
}

function parsePatchQuotesDataMessage({
  patches,
}: RawPayloadResponseQuotesPatch): QuotesResponse | null {
  const valueIfPath = (value: number, path: string, suffix: string) =>
    path.endsWith(suffix) ? value : undefined;
  const quotes = patches.flatMap(({ path, value }) => {
    if (path && isNumber(value)) {
      const fieldValues = Object.fromEntries(
        ALL_FIELDS.map((f) => [f, valueIfPath(value, path, `/${f}`)])
      );
      const symbolIndex = +path.split("/")[2];
      const quote = parseQuoteItem({ values: fieldValues });
      return [{ ...quote, symbolIndex }];
    } else if (typeof value === "object" && "items" in value) {
      const { items } = value;
      return items.map(parseQuoteItem);
    } else if (typeof value === "object" && "values" in value) {
      return [parseQuoteItem(value)];
    } else {
      return [];
    }
  });
  const finalQuotes = compact(quotes);
  return !isEmpty(finalQuotes)
    ? { quotes: finalQuotes.map((q) => omitBy(q, isNil)), service: "quotes" }
    : null;
}
