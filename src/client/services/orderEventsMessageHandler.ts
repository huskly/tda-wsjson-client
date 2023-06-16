import WebSocketApiMessageHandler from "./webSocketApiMessageHandler";
import { RawPayloadRequest, RawPayloadResponse } from "../tdaWsJsonTypes";
import { ApiService } from "./apiService";
import { compact, isEmpty, isObject } from "lodash";
import { throwError } from "../util";

export type OrderPatch = {
  op: string;
  path: string;
  value?: OrderEvent | OrderEvent[] | string | number;
};

export type OrderEvent = {
  id: number;
  symbol: string;
  status: string;
  quantity: number;
  price: number;
  orderType: string;
  side: "BUY" | "SELL";
  description: string;
  orderDateTime: Date;
  cancelable: boolean;
  underlyingType: string;
};

export type RawOrderEvent = {
  eventType: string;
  eventTime: number;
  orderId: number;
  refOrderId: number;
  triggerOrderId: number;
  executionId: number;
  orderTime: string;
  description: string;
  descriptionToShare: string;
  accountCode: string;
  status: string;
  tag: string;
  side: "BUY" | "SELL";
  taxLotMethod: string;
  orderType: string;
  tif: string;
  exchange: string;
  spreadName: string;
  sellOut: boolean;
  quantity: number;
  filledQuantity: number;
  limitPrice: number;
  priceType: string;
  price: number;
  cost: number;
  groupId: number;
  groupMarker: string;
  unionId: number;
  cancelable: boolean;
  replaceable: boolean;
  exercise: boolean;
  similarAllowed: boolean;
  oppositeAllowed: boolean;
  underlyingSymbol: string;
  underlyingType: string;
  rootSymbol: string;
  compositeSymbol: string;
  legs: {
    symbol: string;
    positionEffect: string;
    quantity: number;
    instrumentType: string;
  }[];
  legsDescription: string;
  legsDescriptionDisplay: string;
};

export type RawOrderEventsResponse = {
  patches?: {
    op: string;
    path: string;
    value?: Partial<RawOrderEvent> | { orders: RawOrderEvent[] };
  }[];
  orders?: RawOrderEvent[];
};

export type OrderEventsSnapshotResponse = {
  orders: OrderEvent[];
  service: "order_events";
};

export type OrderEventsPatchResponse = {
  patches: OrderPatch[];
  service: "order_events";
};

export type OrderEventsResponse =
  | OrderEventsSnapshotResponse
  | OrderEventsPatchResponse;

export default class OrderEventsMessageHandler
  implements WebSocketApiMessageHandler<never, OrderEventsResponse>
{
  parseResponse(message: RawPayloadResponse): OrderEventsResponse | null {
    const [{ header, body }] = message.payload;
    switch (header.type) {
      case "snapshot": {
        const { orders } = body as RawOrderEventsResponse;
        const parsedOrders = compact(
          orders?.map((order) => parseOrderEvent(order))
        );
        return { orders: parsedOrders || [], service: "order_events" };
      }
      case "patch": {
        const { patches } = body as RawOrderEventsResponse;
        const parsedPatches = patches?.map(({ value, ...rest }) => ({
          value: parsePatchValue(value),
          ...rest,
        }));
        return {
          patches: parsedPatches,
          service: "order_events",
        } as OrderEventsPatchResponse;
      }
      default:
        console.warn("Unexpected positions response", message);
        return null;
    }
  }

  buildRequest(_: never): RawPayloadRequest {
    throw new Error("Should never be called, this message is inbound only");
  }

  service: ApiService = "order_events";
}

function parsePatchValue(value: any) {
  if (Array.isArray(value)) {
    return value.map(parseOrderEvent);
  }
  if (isObject(value)) {
    if ("orders" in value) {
      const orders = value.orders as RawOrderEvent[];
      return orders.map(parseOrderEvent);
    } else {
      return parseOrderEvent(value as RawOrderEvent);
    }
  } else {
    return value;
  }
}

function parseOrderEvent(order?: RawOrderEvent): OrderEvent | null {
  if (!order) {
    return null;
  }
  if (isEmpty(order)) {
    return {} as OrderEvent;
  }
  return {
    id: order.orderId ?? throwError("missing orderId"),
    symbol: order.compositeSymbol ?? throwError("missing compositeSymbol"),
    status: order.status,
    quantity: order.quantity ?? throwError("missing quantity"),
    price: order.price ?? throwError("missing price"),
    orderType: order.orderType ?? throwError("missing orderType"),
    side: order.side ?? throwError("missing side"),
    description: order?.description,
    orderDateTime: order?.orderTime ? new Date(order.orderTime) : new Date(),
    cancelable: order?.cancelable,
    underlyingType: order?.underlyingType,
  };
}
