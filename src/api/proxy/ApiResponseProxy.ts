import type { ApiResponse } from "../ApiResponse";

export interface ApiResponseProxy {
  name : string;
  apply(response : ApiResponse) : ApiResponse | Promise<ApiResponse>;
}