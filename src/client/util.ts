import { AccountPosition } from "./services/positionsMessageHandler";

export declare type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[P] extends readonly (infer X)[]
    ? readonly DeepPartial<X>[]
    : DeepPartial<T[P]>;
};

export function throwError(msg: string): never {
  throw new Error(msg);
}

export function positionNetQuantity(position: AccountPosition): number {
  return position.longQuantity - position.shortQuantity;
}

// eslint-disable-line @typescript-eslint/no-explicit-any
export function debugLog(...args: any[]) {
  if (process.env.NODE_ENV === "development") {
    console.log(...args);
  }
}
