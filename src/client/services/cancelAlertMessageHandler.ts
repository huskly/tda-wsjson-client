import WebSocketApiMessageHandler from "./webSocketApiMessageHandler";
import { AlertsResponse, RawAlertCancelResponse } from "../types/alertTypes";
import { RawPayloadRequest, RawPayloadResponse } from "../tdaWsJsonTypes";
import { debugLog } from "../util";
import { ApiService } from "./apiService";

export default class CancelAlertMessageHandler
  implements WebSocketApiMessageHandler<number, AlertsResponse>
{
  parseResponse(message: RawPayloadResponse): AlertsResponse | null {
    const [{ body }] = message.payload;
    const { alertId, result } = body as RawAlertCancelResponse;
    if (result === "Alert cancelled") {
      debugLog(`Alert cancelled, id=${alertId}`);
    } else {
      console.warn("Unexpected alert/cancel response", { alertId, result });
    }
    return null;
  }

  buildRequest(alertId: number): RawPayloadRequest {
    return {
      payload: [
        {
          header: { service: "alerts/cancel", id: "cancel_alert", ver: 0 },
          params: { alertId },
        },
      ],
    };
  }

  service: ApiService = "alerts/cancel";
}
