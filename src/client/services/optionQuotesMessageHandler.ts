import WebSocketApiMessageHandler from "./webSocketApiMessageHandler";
import { RawPayloadRequest, RawPayloadResponse } from "../tdaWsJsonTypes";
import { throwError } from "../util";
import { ApiService } from "./apiService";

export default class OptionQuotesMessageHandler
  implements WebSocketApiMessageHandler<any, any>
{
  parseResponse(_: RawPayloadResponse): any {
    throwError("Not implemented");
  }

  buildRequest(_: any): RawPayloadRequest {
    throwError("Not implemented");
  }

  service: ApiService = "quotes/options";
}
