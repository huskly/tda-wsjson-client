import { RawPayloadResponse } from "../tdaWsJsonTypes";

export type RawPayloadResponseUserProperties = {
  defaultAccountCode: string;
  nickname: string;
  plDisplayMethod: string;
  stocksOrderDefaultType: string;
  stocksOrderDefaultQuantity: number;
  stocksOrderQuantityIncrement: number;
  optionsOrderDefaultType: string;
  optionsOrderDefaultQuantity: number;
  optionsOrderQuantityIncrement: number;
  futuresOrderOrderDefaultType: string;
  futuresOrderDefaultType: string;
  futuresOrderDefaultQuantity: number;
  futuresOrderQuantityIncrement: number;
  futureOptionsOrderDefaultType: string;
  futureOptionsOrderDefaultQuantity: number;
  futureOptionsOrderQuantityIncrement: number;
  forexOrderDefaultType: string;
  forexOrderDefaultQuantity: number;
  forexOrderQuantityIncrement: number;
};

export function parseUserPropertiesResponse(
  message: RawPayloadResponse
): RawPayloadResponseUserProperties {
  return message.payload[0].body as RawPayloadResponseUserProperties;
}
