import MessageServiceDefinition from "./messageServiceDefinition";
import { RawPayloadRequest, RawPayloadResponse } from "../tdaWsJsonTypes";

export default class OptionQuotesService
  implements MessageServiceDefinition<any, any>
{
  parseResponse(message: RawPayloadResponse): any {}

  sendRequest(args: any): RawPayloadRequest {
    return undefined;
  }
}
