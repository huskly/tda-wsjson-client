import MessageServiceDefinition from "./messageServiceDefinition";
import { InstrumentSearchResponse } from "../types/instrumentSearchTypes";
import { RawPayloadRequest, RawPayloadResponse } from "../tdaWsJsonTypes";

export default class InstrumentSearchService
  implements MessageServiceDefinition<string, InstrumentSearchResponse>
{
  parseResponse(message: RawPayloadResponse): InstrumentSearchResponse {
    return undefined;
  }

  sendRequest(args: string): RawPayloadRequest {
    return undefined;
  }
}
