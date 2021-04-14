import type { ApiBridge, ApiRequest } from '../api';
import { Api } from '../api/Api';

function GenerateClient(api : ApiBridge) {
  
  const ClientEndpoints : ApiClientEndpoint = {

  } as const;

  return ClientEndpoints;
}

export type ApiClientEndpoint = {
  [name : string] : ApiClientFunction | ApiClientEndpoint;
};

export type ApiClientFunction<T = any> = (url : string, data? : any, options? : Omit<ApiRequest, "url" | "body">) => Promise<T>;

export const ApiClient = GenerateClient(new Api);