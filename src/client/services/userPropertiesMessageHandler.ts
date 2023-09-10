import { RawPayloadRequest, RawPayloadResponse } from "../tdaWsJsonTypes";
import WebSocketApiMessageHandler, {
  newPayload,
} from "./webSocketApiMessageHandler";
import { ApiService } from "./apiService";

export type UserPropertiesResponse = {
  service: "user_properties";
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

export default class UserPropertiesMessageHandler
  implements WebSocketApiMessageHandler<never, UserPropertiesResponse>
{
  parseResponse(message: RawPayloadResponse): UserPropertiesResponse {
    const body = message.payload[0].body;
    return { ...body, service: "user_properties" } as UserPropertiesResponse;
  }

  buildRequest(_: void): RawPayloadRequest {
    return newPayload({
      header: { service: "user_properties", id: "user_properties", ver: 0 },
      params: {},
    });
  }

  service: ApiService = "user_properties";
}
