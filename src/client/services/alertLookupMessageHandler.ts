import WebSocketApiMessageHandler from "./webSocketApiMessageHandler";
import { RawPayloadRequest, RawPayloadResponse } from "../tdaWsJsonTypes";
import {
  LookupAlertsResponse,
  parseAlert,
  RawAlertResponse,
} from "../types/alertTypes";
import { isEmpty } from "lodash";
import { ApiService } from "./apiService";

export type RawAlertLookupResponse = {
  alerts: RawAlertResponse[];
};

export default class AlertLookupMessageHandler
  implements WebSocketApiMessageHandler<never, LookupAlertsResponse | null>
{
  parseResponse({
    payload: [{ body }],
  }: RawPayloadResponse): LookupAlertsResponse | null {
    const { alerts } = body as RawAlertLookupResponse;
    if (!isEmpty(alerts)) {
      const parsedAlerts = alerts.map((alert) =>
        parseAlert({ rawAlert: alert })
      );
      return { alerts: parsedAlerts, service: "alerts/lookup" };
    } else {
      return null;
    }
  }

  buildRequest(_: never): RawPayloadRequest {
    return {
      payload: [
        {
          header: {
            service: "alerts/lookup",
            id: "ACTIVE_alerts_lookup",
            ver: 0,
          },
          params: { status: "ACTIVE" },
        },
      ],
    };
  }

  service: ApiService = "alerts/lookup";
}
