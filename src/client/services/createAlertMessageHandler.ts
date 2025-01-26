import WebSocketApiMessageHandler from "./webSocketApiMessageHandler.js";
import { CreateAlertResponse, RawAlertResponse } from "../types/alertTypes.js";
import { RawPayloadRequest, RawPayloadResponse } from "../tdaWsJsonTypes.js";
import { ApiService } from "./apiService.js";
import { newRandomId } from "../util.js";

type RawAlertCreateResponse = {
  alert: RawAlertResponse;
};

export type CreateAlertRequestParams = {
  symbol: string;
  triggerPrice: number;
  operator: "GREATER_OR_EQUAL" | "LESS_OR_EQUAL";
};

export default class CreateAlertMessageHandler
  implements
    WebSocketApiMessageHandler<
      CreateAlertRequestParams,
      CreateAlertResponse | null
    >
{
  parseResponse(message: RawPayloadResponse): CreateAlertResponse | null {
    const [{ body }] = message.payload;
    const { alert } = body as RawAlertCreateResponse;
    if (alert) {
      const symbol = alert.market.components[0].symbol;
      const triggerPrice = alert.market.threshold;
      const { id, status } = alert;
      const description = `Alert for ${symbol} ${alert.market.operator} ${triggerPrice}`;
      const alerts = [{ id, symbol, triggerPrice, status, description }];
      return { alerts, service: "alerts/create" };
    }
    return null;
  }

  buildRequest({
    symbol,
    triggerPrice,
    operator,
  }: CreateAlertRequestParams): RawPayloadRequest {
    const id = newRandomId();
    return {
      payload: [
        {
          header: { service: "alerts/create", ver: 0, id: `alert-${id}` },
          params: {
            alert: {
              market: {
                components: [{ symbol, quantity: 1 }],
                exchange: "BEST",
                threshold: triggerPrice,
                field: "MARK",
                operator,
              },
            },
          },
        },
      ],
    };
  }

  service: ApiService = "alerts/create";
}
