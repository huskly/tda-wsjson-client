import { RawPayloadRequest, RawPayloadResponse } from "../tdaWsJsonTypes";
import MessageServiceDefinition from "./messageServiceDefinition";
import { RawPayloadResponseUserProperties } from "../types/userPropertiesTypes";

export default class UserPropertiesService
  implements MessageServiceDefinition<void, RawPayloadResponseUserProperties>
{
  parseResponse(message: RawPayloadResponse): UserPropertiesResponse {
    return undefined;
  }

  sendRequest(_: void): RawPayloadRequest {
    return undefined;
  }
}
