import MessageServiceDefinition from "./messageServiceDefinition";
import { PositionsResponse } from "../types/positionsTypes";
import { RawPayloadRequest, RawPayloadResponse } from "../tdaWsJsonTypes";

export default class PositionsService
  implements MessageServiceDefinition<string, PositionsResponse>
{
  parseResponse(message: RawPayloadResponse): PositionsResponse {
    return undefined;
  }

  sendRequest(args: string): RawPayloadRequest {
    return undefined;
  }
}
