import WebSocketApiMessageHandler from "./webSocketApiMessageHandler.js";
import { RawPayloadRequest, RawPayloadResponse } from "../tdaWsJsonTypes.js";
import {
  AlertSubscribeResponse,
  parseAlert,
  RawAlertSubscribeResponse,
} from "../types/alertTypes.js";
import { ApiService } from "./apiService.js";

export const DEFAULT_ALERT_TYPES = [
  "CHANGED_ALERT",
  "TRIGGERED_ALERT",
  "EXPIRED_ALERT",
  "MULTIPLE_EXPIRED_ALERTS",
];

export default class SubscribeToAlertMessageHandler
  implements
    WebSocketApiMessageHandler<string[], AlertSubscribeResponse | null>
{
  parseResponse(message: RawPayloadResponse): AlertSubscribeResponse | null {
    const [{ body }] = message.payload;
    const { type, result, alert, alertDescription, changedAlert } =
      body as RawAlertSubscribeResponse;
    switch (type) {
      case "AlertsSubscriptionConfirmationResponse":
        if (result !== "Subscribed OK.") {
          const errorMsg =
            "Received error response from `alert/subscribe` request";
          console.error(errorMsg, { type, result });
        }
        // return null since this response is a no-op message
        return null;
      case "ChangedAlertResponse":
        return {
          service: "alerts/subscribe",
          alerts: [parseAlert({ rawAlert: changedAlert! })], // eslint-disable-line @typescript-eslint/no-non-null-assertion
        };
      case "TriggeredAlertResponse":
        return {
          service: "alerts/subscribe",
          alerts: [
            parseAlert({
              rawAlert: alert!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
              description: alertDescription,
            }),
          ],
        };
    }
  }

  buildRequest(alertTypes: string[] = DEFAULT_ALERT_TYPES): RawPayloadRequest {
    return {
      payload: [
        {
          header: {
            service: "alerts/subscribe",
            id: "alerts_subscribe",
            ver: 0,
          },
          params: { alertTypes },
        },
      ],
    };
  }

  service: ApiService = "alerts/subscribe";
}
