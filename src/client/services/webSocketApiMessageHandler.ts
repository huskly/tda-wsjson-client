import {
  RawPayloadRequest,
  RawPayloadRequestItem,
  RawPayloadResponse,
} from "../tdaWsJsonTypes";
import { ApiService } from "./apiService";

// Service interface definition for implementing support for new message types
export default interface WebSocketApiMessageHandler<ReqType, ResType> {
  service: ApiService;
  buildRequest: (args: ReqType) => RawPayloadRequest;
  parseResponse: (message: RawPayloadResponse) => ResType;
}

export function newPayload(item: RawPayloadRequestItem) {
  return { payload: [item] };
}
