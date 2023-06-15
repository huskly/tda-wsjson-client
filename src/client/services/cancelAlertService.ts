import MessageServiceDefinition from "./messageServiceDefinition";
import { AlertsResponse } from "../types/alertTypes";
import { RawPayloadRequest, RawPayloadResponse } from "../tdaWsJsonTypes";

export default class CancelAlertService
  implements MessageServiceDefinition<number, AlertsResponse>
{
  parseResponse(message: RawPayloadResponse): AlertsResponse {
    return undefined;
  }

  sendRequest(args: number): RawPayloadRequest {
    return undefined;
  }
}
