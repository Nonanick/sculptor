import type { Maybe, MaybePromise } from "../../error/Maybe";
import type { ApiRequest } from "../ApiRequest";

export interface ApiRequestProxy {
  name : string;
  apply(request : ApiRequest) : Maybe<ApiRequest> | MaybePromise<ApiRequest>;
}