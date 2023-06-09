import { RawPayloadResponse } from "../tdaWsJsonTypes";
import { OrderEvent, OrderPatch } from "./orderEventTypes";

export type RawPlaceOrderPatchResponse = {
  patches: {
    op: string;
    path: string;
    value: any;
  }[];
};

export type RawPlaceOrderSnapshotResponse = {
  groupType: string;
  confirmation: {
    commission: number;
    cost: number;
    fee: number;
    rows: {
      title: string;
      value: string;
    }[];
  };
  maxOrders: number;
  orders: RawPlaceOrderItem[];
};

type RawPlaceOrderItem = {
  orderId: number;
  types: { values: string[]; selection: number };
  exchanges: { values: string[]; selection: number };
  tifs: { values: string[]; selection: number };
  legsDescription: string;
  actionDescription: string;
  orderLegsDescription: string;
  orderLegsDescDisplay: string;
  dollarValue: number;
  quantity: number;
  legs: [{ symbol: string }];
  priceLocked: boolean;
  limitPrice: number;
  midPrice: number;
  natPrice: number;
  bidPrice: number;
  askPrice: number;
  priceStep: number;
  priceFractionalType: string;
  underlyingSymbol: string;
  spreadName: string;
  descriptionToShare: string;
  futureSpread: boolean;
  confirmation: string;
  minQty: number;
  maxQty: number;
  priceType: string;
  compositeSymbol: string;
  compositeDisplaySymbol: string;
  quantityOffset: number;
  quantityStep: number;
  limitOffsetStep: number;
  stopOffsetStep: number;
  quantityLinkOptions: string[];
  descriptionTemplate: string;
};

export type PlaceOrderSnapshotResponse = {
  orders: OrderEvent[];
  service: "place_order";
};

export type PlaceOrderPatchResponse = {
  patches: OrderPatch[];
  service: "place_order";
};

function parsePlaceOrderSnapshotResponse({
  orders,
}: RawPlaceOrderSnapshotResponse): PlaceOrderSnapshotResponse {
  const parsedOrders = orders.map((order) => ({
    id: order.orderId,
    symbol: order.compositeDisplaySymbol,
    quantity: order.quantity,
    price: +order.priceType.substring(1).replace(" LMT", ""),
    orderType: "LIMIT", // TODO: unclear if this is always the case
    side: order.actionDescription.startsWith("BUY")
      ? "BUY"
      : ("SELL" as "BUY" | "SELL"),
    cancelable: true,
    orderDateTime: new Date(),
    description: order.actionDescription,
    status: "",
    underlyingType: "unknown",
  }));
  return { orders: parsedOrders, service: "place_order" };
}

function parsePlaceOrderPatchResponse({
  patches,
}: RawPlaceOrderPatchResponse): PlaceOrderSnapshotResponse | null {
  // this is pretty annoying - unlike snapshot, the patch API doesn't send
  // the raw order data, so instead we need to parse the order details out
  // of the description string
  // TODO: This payload may include multiple orders? If so parse all of them
  const descriptionPatch = patches.find(
    ({ op, path }) =>
      op === "replace" && path.match(/\/orders\/\d\/descriptionToShare/)
  );
  if (descriptionPatch) {
    const { value } = descriptionPatch;
    // eg.: "BUY +1 COIN @37.34 LMT"
    const parts = value.split(" ");
    const parsedOrder = {
      id: 0,
      symbol: parts[2],
      quantity: +parts[1],
      price: +parts[3].substring(1),
      orderType: "LIMIT", // TODO: unclear if this is always the case
      side: parts[0] as "BUY" | "SELL",
      cancelable: true,
      orderDateTime: new Date(),
      description: value,
      status: "",
      underlyingType: "unknown",
    };
    return { orders: [parsedOrder], service: "place_order" };
  } else {
    return null;
  }
}

export function parsePlaceOrderResponse(
  message: RawPayloadResponse
): PlaceOrderSnapshotResponse | PlaceOrderPatchResponse | null {
  const [{ header, body }] = message.payload;
  switch (header.type) {
    case "snapshot":
      return parsePlaceOrderSnapshotResponse(
        body as RawPlaceOrderSnapshotResponse
      );
    case "patch":
      return parsePlaceOrderPatchResponse(body as RawPlaceOrderPatchResponse);
    default:
      console.warn("Unexpected place_order response", message);
      return null;
  }
}
