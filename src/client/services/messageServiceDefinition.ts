import {
  ParsedWebSocketResponse,
  RawPayloadRequest,
  RawPayloadRequestItem,
  RawPayloadResponse,
} from "../tdaWsJsonTypes";

// Service interface definition for implementing support for new message types
export default interface MessageServiceDefinition<
  ReqType,
  ResType extends ParsedWebSocketResponse
> {
  sendRequest: (args: ReqType) => RawPayloadRequest;
  parseResponse: (message: RawPayloadResponse) => ResType | null;
}

export function newPayload(item: RawPayloadRequestItem) {
  return { payload: [item] };
}
