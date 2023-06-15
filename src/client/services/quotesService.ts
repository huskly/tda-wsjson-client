import { Message } from "esbuild";
import MessageServiceDefinition from "./messageServiceDefinition";
import { QuotesResponse } from "../types/quoteTypes";
import { RawPayloadRequest, RawPayloadResponse } from "../tdaWsJsonTypes";

export default class QuotesService
  implements MessageServiceDefinition<string[], QuotesResponse>
{
  parseResponse(message: RawPayloadResponse): QuotesResponse {
    return undefined;
  }

  sendRequest(args: string[]): RawPayloadRequest {
    return undefined;
  }
}
