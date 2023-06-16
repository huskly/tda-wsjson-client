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

export function parseAlert({
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
