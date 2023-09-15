import WebSocketApiMessageHandler, {
  newPayload,
} from "./webSocketApiMessageHandler";
import { RawPayloadRequest, RawPayloadResponse } from "../tdaWsJsonTypes";
import { ApiService } from "./apiService";
import { isObject } from "lodash";

export type GetWatchListResponseItem = {
  id: number;
  name: string;
  type?: string;
  symbols?: string[];
};

export type GetWatchlistSnapshotResponse = {
  watchlist: GetWatchListResponseItem;
  service: "watchlist/get";
};

export type GetWatchlistPatchResponse = {
  patches: {
    op: string;
    path: string;
    value: { watchlist: GetWatchListResponseItem } | number | string | string[];
  }[];
  service: "watchlist/get";
};

export type GetWatchlistResponse = GetWatchlistSnapshotResponse;

export default class GetWatchlistMessageHandler
  implements WebSocketApiMessageHandler<number, GetWatchlistResponse | null>
{
  buildRequest(watchlistId: number): RawPayloadRequest {
    return newPayload({
      header: {
        service: "watchlist/get",
        id: "watchlist/get",
        ver: 0,
      },
      params: { watchlistId },
    });
  }

  parseResponse(message: RawPayloadResponse): GetWatchlistResponse | null {
    const [{ header, body }] = message.payload;
    switch (header.type) {
      case "snapshot": {
        if ("watchlist" in body) {
          const { watchlist } = body as { watchlist: GetWatchListResponseItem };
          return { watchlist, service: "watchlist/get" };
        } else {
          console.warn(
            "Unexpected watchlist/get snapshot response with missing `watchlist` object",
            message
          );
          return null;
        }
      }
      case "patch": {
        return parseGetWatchlistPatchResponse(
          body as GetWatchlistPatchResponse
        );
      }
      default:
        console.warn("Unexpected watchlist/get response", message);
        return null;
    }
  }

  service: ApiService = "watchlist/get";
}

function parseGetWatchlistPatchResponse(
  body: GetWatchlistPatchResponse
): GetWatchlistResponse {
  const { patches } = body as GetWatchlistPatchResponse;
  const { path, value } = patches[0];
  if (path === "" && isObject(value)) {
    const { watchlist } = value as {
      watchlist: GetWatchListResponseItem;
    };
    return { watchlist, service: "watchlist/get" };
  }
  const watchlist: Record<string, any> = {};
  patches.forEach(({ path, value }) => {
    const pathParts = path.split("/");
    const key = pathParts[pathParts.length - 1];
    watchlist[key] = value;
  });
  return {
    watchlist: watchlist as GetWatchListResponseItem,
    service: "watchlist/get",
  };
}
