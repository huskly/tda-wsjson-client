import MessageServiceDefinition from "./messageServiceDefinition";
import { OptionChainResponse } from "../types/optionChainTypes";
import { RawPayloadRequest, RawPayloadResponse } from "../tdaWsJsonTypes";

export default class OptionSeriesService
  implements MessageServiceDefinition<string, OptionChainResponse>
{
  parseResponse(message: RawPayloadResponse): OptionChainResponse {
    return undefined;
  }

  sendRequest(args: string): RawPayloadRequest {
    return undefined;
  }
}
