import type { MaybePromise } from "../error/Maybe";
import type { ApiBridge } from "./ApiBridge";
import type { ApiPendingRequest } from "./ApiPendingRequest";
import type { ApiRequest } from "./ApiRequest";
import type { ApiResponse } from "./ApiResponse";
import type { ApiRequestProxy } from "./proxy/ApiRequestProxy";
import type { ApiResponseProxy } from "./proxy/ApiResponseProxy";

export class Api implements ApiBridge {

  private _requestProxies: ApiRequestProxy[] = [];

  private _responseProxies: ApiResponseProxy[] = [];

  constructor(private serverURL?: string) {

  }

  get<Payload = any>(url: string, queryParams?: { [name: string]: string }, options?: SpecialRequestOptions): ApiPendingRequest<Payload> {

    if (queryParams != null) {
      let queryStr = Object.entries(queryParams).map(([key, value]) => {
        return `${encodeURI(key)}=${encodeURI(value)}`
      }).join('&');

      if (url.indexOf('?') >= 0) {
        url += '&' + queryStr;
      } else {
        url += '?' + queryStr;
      }
    }

    return this.request({
      ...options,
      method: 'GET',
      url
    });
  }

  post<Payload = any>(url: string, body?: any, options?: SpecialRequestOptions): ApiPendingRequest<Payload> {

    return this.request({
      ...options,
      method: 'POST',
      url: url,
      body
    });

  }

  put<Payload = any>(url: string, body?: any, options?: SpecialRequestOptions): ApiPendingRequest<Payload> {

    return this.request({
      ...options,
      method: 'PUT',
      url: url,
      body
    });

  }

  delete<Payload = any>(url: string, body?: any, options?:SpecialRequestOptions): ApiPendingRequest<Payload> {

    return this.request({
      ...options,
      method: 'DELETE',
      url: url,
      body
    });

  }

  patch<Payload = any>(url: string, body?: any, options?: SpecialRequestOptions): ApiPendingRequest<Payload> {

    return this.request({
      ...options,
      method: 'PATCH',
      url: url,
      body
    });

  }

  request<Payload = any>(request: ApiRequest): ApiPendingRequest<Payload> {

    const startTime = performance.now();
    const abortCtrl = new AbortController();

    const proxiedResponse = this.applyRequestProxies(request);

    if(proxiedResponse instanceof Error) { 
      const errorPromise = Promise.reject(proxiedResponse);

      return {
        then: errorPromise.then,
        catch: errorPromise.catch,
        finally: errorPromise.finally,
        [Symbol.toStringTag]: errorPromise[Symbol.toStringTag],
        elapsedTime() {
          return performance.now() - startTime;
        },
        isPending() { return false},
        hasFailed() { return true },
        request,
        startTime,
        abort: abortCtrl.abort
      };

    }

    let isResolved = false;
    let hasFailed = false;

    let fetchResp = fetch(request.url, {
      body: JSON.stringify(request.body),
      headers: request.headers,
      credentials: request.sendCookies === true ? 'include' : 'omit',
      signal: abortCtrl.signal,
      method: request.method,
      // TODO check by itself if it should use CORS based on serverURL / window.location
    });

    let resolvedPromise = fetchResp.then(async response => {
      isResolved = true;
      hasFailed = false;

      let apiResponse: ApiResponse = {
        elapsedTime: performance.now() - startTime,
        headers: response.headers as any,
        payload: response.json(),
        redirected: response.redirected,
        request,
        status: response.status,
        requestStartTime: startTime,
        requestEndTime: performance.now()
      };

      const proxiedResponse = this.applyResponseProxies(apiResponse);

      return proxiedResponse;
    });

    fetchResp.catch(_ => { isResolved = true; hasFailed = true; });

    let pendingRequest: ApiPendingRequest = {
      then: resolvedPromise.then,
      catch: fetchResp.catch,
      finally: resolvedPromise.finally,
      [Symbol.toStringTag]: fetchResp[Symbol.toStringTag],
      elapsedTime() {
        return performance.now() - startTime;
      },
      isPending() { return !isResolved},
      hasFailed() { return !hasFailed},
      request,
      startTime,
      abort: abortCtrl.abort
    };

    return pendingRequest;
  }

  clone(): ApiBridge {

    const newApi = new Api(this.serverURL);

    newApi._responseProxies = [...this._responseProxies];
    newApi._requestProxies = [...this._requestProxies];

    return newApi;

  }

  addRequestProxy(proxy: ApiRequestProxy): void {
    if (!this._requestProxies.includes(proxy)) {
      this._requestProxies.push(proxy);
    }
  }

  removeRequestProxy(proxy: ApiRequestProxy): void {
    if (this._requestProxies.includes(proxy)) {
      this._requestProxies = this._requestProxies.filter(p => p != proxy);
    }
  }

  addResponseProxy(proxy: ApiResponseProxy): void {
    if (!this._responseProxies.includes(proxy)) {
      this._responseProxies.push(proxy);
    }
  }
  
  removeResponseProxy(proxy: ApiResponseProxy): void {
    if (this._responseProxies.includes(proxy)) {
      this._responseProxies = this._responseProxies.filter(p => p != proxy);
    }
  }

  private async applyRequestProxies(request : ApiRequest) : MaybePromise<ApiRequest> {

    for(let proxy of this._requestProxies) {

      try { 
        let newRequest = await proxy.apply(request);
        if(newRequest != null && ! (newRequest instanceof Error) ) {
          request = newRequest;
        } else {
          return newRequest;
        }
      } catch(err) {
        console.warn('[API] Request proxy', proxy.name, 'failed with error: ', err)
       return err;
      }
    }

    return request;
  }

  private async applyResponseProxies(response : ApiResponse) : Promise<ApiResponse> {
    for(let proxy of this._responseProxies) {
      try { 
        let newResponse = await proxy.apply(response);
        if(newResponse != null && ! (newResponse instanceof Error) ) {
          response = newResponse;
        }
      } catch(err) {
        console.error('[API] Failed to process API Response through proxy', proxy.name, ', response proxies should not fail!');
      }
    }
    return response;
  }
}

export type SpecialRequestOptions = Omit<ApiRequest, "method" | "url" | "body">;