import { RawPayloadRequest } from "./tdaWsJsonTypes";

export type ChartRequestParams = {
  symbol: string;
  timeAggregation: string;
  range: string;
  includeExtendedHours: boolean;
};

export function newConnectionRequest() {
  return {
    ver: "27.*.*",
    fmt: "json-patches-structured",
    heartbeat: "2s",
  };
}

export function newAccountPositionsRequest(
  accountNumber: string
): RawPayloadRequest {
  return {
    payload: [
      {
        header: { service: "positions", ver: 0, id: "positions" },
        params: {
          account: accountNumber,
          betaWeightingSymbols: [],
          //additional fields are: MARK DELTA GAMMA THETA VEGA RHO OPEN_COST BP_EFFECT MARK_CHANGE MARGIN
          fields: [
            "QUANTITY",
            "OPEN_PRICE",
            "NET_LIQ",
            "PL_OPEN",
            "PL_YTD",
            "PL_DAY",
          ],
        },
      },
    ],
  };
}

export function newQuotesRequest(symbols: string[]): RawPayloadRequest {
  return {
    payload: [
      {
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
      },
    ],
  };
}

export function newUserPropertiesRequest(): RawPayloadRequest {
  return {
    payload: [
      {
        header: { service: "user_properties", id: "user_properties", ver: 0 },
        params: {},
      },
    ],
  };
}

export function newChartRequest({
  symbol,
  timeAggregation,
  range,
  includeExtendedHours,
}: ChartRequestParams): RawPayloadRequest {
  return {
    payload: [
      {
        header: { service: "chart", id: "chart-page-chart-1", ver: 1 },
        params: {
          symbol,
          timeAggregation,
          studies: [],
          range,
          extendedHours: includeExtendedHours,
        },
      },
    ],
  };
}

export function newLoginRequest(accessToken: string): RawPayloadRequest {
  return {
    payload: [
      {
        header: { service: "login", id: "login", ver: 0 },
        params: {
          accessToken,
          domain: "TOS",
          platform: "PROD",
          token: "",
          tag: "TOSWeb",
        },
      },
    ],
  };
}
