import type { ApiPendingRequest } from './ApiPendingRequest';
import type { ApiRequest } from './ApiRequest';
import type { ApiRequestProxy } from './proxy/ApiRequestProxy';
import type { ApiResponseProxy } from './proxy/ApiResponseProxy';

export interface ApiBridge {
  request<Payload = any>(request: ApiRequest): ApiPendingRequest<Payload>;
  clone(): ApiBridge;
  addRequestProxy(proxy: ApiRequestProxy): void;
  removeRequestProxy(proxy : ApiRequestProxy) : void;
  addResponseProxy(proxy: ApiResponseProxy): void;
  removeResponseProxy(proxy : ApiResponseProxy) : void;
}