import MessageServiceDefinition from "./messageServiceDefinition";
import { CreateAlertRequestParams } from "../messageBuilder";
import { AlertsResponse } from "../types/alertTypes";
import { RawPayloadRequest, RawPayloadResponse } from "../tdaWsJsonTypes";

export default class CreateAlertService
  implements MessageServiceDefinition<CreateAlertRequestParams, AlertsResponse>
{
  parseResponse(message: RawPayloadResponse): AlertsResponse {
    return undefined;
  }

  sendRequest(args: CreateAlertRequestParams): RawPayloadRequest {
    return undefined;
  }
}
