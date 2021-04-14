import type { ApiRequest } from './ApiRequest';
import type { ApiResponse } from './ApiResponse';

export interface ApiPendingRequest<T = any> extends Promise<ApiResponse<T>> {
  abort() : void;
  elapsedTime() : number;
  startTime : number;
  request : ApiRequest;
  isPending() : boolean;
  hasFailed() : boolean;
}