export type AlertStatus = "ACTIVE" | "CANCELED" | "TRIGGERED";

export type PriceAlert = {
  id: number;
  symbol: string;
  triggerPrice: number;
  description?: string;
  status?: AlertStatus;
};

export type CreateAlertResponse = {
  alerts: PriceAlert[];
  service: "alerts/create";
};

export type LookupAlertsResponse = {
  alerts: PriceAlert[];
  service: "alerts/lookup";
};

export type AlertSubscribeResponse = {
  alerts: PriceAlert[];
  service: "alerts/subscribe";
};

export type CancelAlertResponse = {
  alerts: PriceAlert[];
  service: "alerts/cancel";
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
