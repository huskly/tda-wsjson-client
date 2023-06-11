import { isEmpty } from "lodash";
import { debugLog } from "../util";

export type AlertStatus = "ACTIVE" | "CANCELED" | "TRIGGERED";

export type PriceAlert = {
  id: number;
  symbol: string;
  triggerPrice: number;
  description?: string;
  status?: AlertStatus;
};

export type AlertsResponse = {
  alerts: PriceAlert[];
};

export type RawAlertResponse = {
  id: number;
  version: number;
  user: { id: string; domain: string };
  time: number;
  closeTime: number;
  activationTime: number;
  expirationRemindTime: number;
  expirationTime: number;
  lastTriggeredTime: number;
  status: AlertStatus;
  market: {
    field: string;
    operator: string;
    exchange: string;
    threshold: number;
    components: [{ symbol: string; assetType: string; quantity: number }];
    type: string;
  };
  lastNotificationTime: number;
};

export type AlertResponseType =
  | "AlertsSubscriptionConfirmationResponse"
  | "ChangedAlertResponse"
  | "TriggeredAlertResponse";

export type RawAlertSubscribeResponse = {
  type: AlertResponseType;
  result?: string;
  changedAlert?: RawAlertResponse;
  alert?: RawAlertResponse;
  alertDescription?: string;
};

export type RawAlertCancelResponse = {
  alertId: number;
  result: string;
};

export type RawAlertCreateResponse = {
  alert: RawAlertResponse;
};

export type RawAlertLookupResponse = {
  alerts: RawAlertResponse[];
};

function parseAlert({
  rawAlert,
  description,
}: {
  rawAlert: RawAlertResponse;
  description?: string;
}): PriceAlert {
  const { market, status, id } = rawAlert;
  return {
    symbol: market.components[0].symbol,
    triggerPrice: market.threshold,
    description,
    status,
    id,
  };
}

export function parseAlertsCreateResponse({
  alert,
}: RawAlertCreateResponse): null {
  if (alert && alert.status === "ACTIVE") {
    debugLog(
      `Alert created, symbol=${alert.market.components[0].symbol}, triggerPrice=${alert.market.threshold}, operator=${alert.market.operator}`
    );
  }
  return null;
}

export function parseAlertCancelResponse({
  alertId,
  result,
}: RawAlertCancelResponse): null {
  if (result === "Alert cancelled") {
    debugLog(`Alert cancelled, id=${alertId}`);
  } else {
    console.warn("Unexpected alert/cancel response", { alertId, result });
  }
  return null;
}

export function parseAlertsLookupResponse(
  body: RawAlertLookupResponse
): AlertsResponse | null {
  const { alerts } = body;
  if (!isEmpty(alerts)) {
    const parsedAlerts = alerts.map((alert) => parseAlert({ rawAlert: alert }));
    return { alerts: parsedAlerts };
  } else {
    return null;
  }
}

export function parseAlertSubscribeResponse({
  type,
  result,
  alert,
  alertDescription,
  changedAlert,
}: RawAlertSubscribeResponse): AlertsResponse | null {
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
        alerts: [parseAlert({ rawAlert: changedAlert! })], // eslint-disable-line @typescript-eslint/no-non-null-assertion
      };
    case "TriggeredAlertResponse":
      return {
        alerts: [
          parseAlert({
            rawAlert: alert!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
            description: alertDescription!,
          }),
        ],
      };
  }
}
