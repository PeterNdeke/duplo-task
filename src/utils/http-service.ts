import nodefetch from "node-fetch";
import { GenericFriendlyError } from "./errors";
import { LoggingService } from "./logger";
import { v4 as uuidv4 } from "uuid";

class MyHeaders {
  private _headers: Map<string, string[]>;
  private _normalizedNames: Map<string, string>;

  constructor() {
    this._headers = new Map();
    this._normalizedNames = new Map();
  }

  append(name: string, value: string | string[]) {
    const existingValues = this.getAll(name);
    if (!existingValues) {
      this.set(name, value);
    } else {
      this.set(name, value, existingValues);
    }
  }

  delete(name: string) {
    const lcName = name.toLowerCase();
    this._normalizedNames.delete(lcName);
    this._headers.delete(lcName);
  }

  get(name: string) {
    const values = this.getAll(name);
    if (values === null) {
      return null;
    }
    return values.length > 1 ? values : values[0];
  }

  has(name: string) {
    return this._headers.has(name.toLowerCase());
  }

  keys() {
    return Array.from(this._normalizedNames.values());
  }

  values() {
    return Array.from(this._headers.values());
  }

  private uniq(a: string[]) {
    return Array.from(new Set(a));
  }

  toJSON() {
    const serialized: { [header: string]: string } = {};
    this._headers.forEach((values, name) => {
      const split: string[] = [];
      values.forEach((v) => {
        split.push(...v.split(","));
      });
      const _name = this._normalizedNames.get(name);
      if (_name && split.length) {
        serialized[_name] = split.length > 1 ? split[0] : split[0];
      }
    });
    return serialized;
  }

  toArrayResult() {
    const obj = this.toJSON();
    const result: string[][] = [];
    Object.keys(obj).forEach((key) => {
      const val = obj[key];
      if (Array.isArray(val)) {
        val.forEach((val2) => {
          result.push([key, val2]);
        });
      } else {
        result.push([key, val]);
      }
    });
    return result;
  }

  private getAll(name: string) {
    return this.has(name)
      ? this._headers.get(name.toLowerCase()) || null
      : null;
  }

  private set(name: string, value: string | string[], oldValues?: string[]) {
    let _values: string[] = Array.isArray(value) ? [...value] : [value];
    if (oldValues) {
      _values = [..._values, ...oldValues];
    }
    _values = this.uniq(_values);
    this._headers.set(name.toLowerCase(), _values);
    this.setNormalizedName(name);
  }

  private setNormalizedName(name: string) {
    const lcName = name.toLowerCase();
    if (!this._normalizedNames.has(lcName)) {
      this._normalizedNames.set(lcName, name);
    }
  }
}

const performanceReportFinal: Record<string, number | undefined> = {};

type IRequestConfig = {
  params: Record<string, string> | undefined | null;
  headers: Record<string, string>;
};

class HttpServiceBase {
  private performanceStart() {
    const id = this.getUUID();

    performanceReportFinal[id] = Date.now();
    return id;
  }

  private performanceEnd(id: string) {
    try {
      if (!id) {
        return undefined;
      }
      const value = performanceReportFinal[id];
      if (value !== undefined) {
        const result = Date.now() - value;
        try {
          delete performanceReportFinal[id];
        } catch (error) {
          //
        }
        return result;
      }
    } catch (error) {
      //
    }
    return undefined;
  }

  private getUUID() {
    return uuidv4();
  }
  private performanceEnd_ToString(id: string) {
    const perf = this.performanceEnd(id);
    if (perf === undefined) {
      return undefined;
    }
    return perf.toString().padStart(6, "0");
  }

  async post<T>({
    url,
    data,
    params,
    headers,
    enableCache,
    cacheExpireInMinutes,
  }: {
    url: string;
    data: any;
    params?: Record<string, string | number | boolean>;
    headers?: string[][];
    enableCache?: boolean;
    cacheExpireInMinutes?: number;
  }) {
    let performanceID: string = "";
    const optionsData = {
      params: this.formatParams(params),
    } as IRequestConfig;
    try {
      const appHeaders = new MyHeaders();
      appHeaders.append("Content-Type", "application/json; charset=UTF-8");
      appHeaders.append("Accept", "application/json");

      if (headers?.length) {
        headers.forEach(([name, value]) => {
          appHeaders.append(name, value);
        });
      }
      optionsData.headers = appHeaders.toJSON();

      LoggingService.info({
        HTTP_TASK: "Calling POST endpoint".toUpperCase(),
        url,
        params: optionsData.params,
      });

      performanceID = this.performanceStart();

      const fullUrl = this.addQueryToUrl({ params: optionsData.params, url });
      const resultData01 = await nodefetch(fullUrl, {
        method: "POST",
        headers: optionsData.headers,
        body: JSON.stringify(data),
      });
      const result01 = await resultData01.json();

      if (!resultData01.ok) {
        this.createThrowError(result01);
      }

      const HTTP_PERFORMANCE_MS = this.performanceEnd_ToString(performanceID);

      LoggingService.info({
        HTTP_TASK: "Success for POST endpoint".toUpperCase(),
        HTTP_PERFORMANCE_MS,
        url,
        params: optionsData.params,
      });

      return result01;
    } catch (error) {
      const HTTP_PERFORMANCE_MS = this.performanceEnd_ToString(performanceID);
      LoggingService.info({
        HTTP_ERROR_TASK: "Error Calling POST endpoint".toUpperCase(),
        HTTP_PERFORMANCE_MS,
        url,
        params: optionsData.params,
      });
      throw error;
    }
  }

  private createThrowError(maxError: any) {
    LoggingService.error({ maxError });
    if (maxError?.message && typeof maxError.message === "string") {
      throw GenericFriendlyError.create(maxError.message);
    }
    throw maxError;
  }

  private formatParams(params: Record<string, any> | undefined | null) {
    try {
      if (params && typeof params === "object" && Object.keys(params).length) {
        const params01: Record<string, any> = {};
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== "") {
            params01[key] = value;
          }
        });
        if (Object.keys(params01).length) {
          return params01;
        }
      }
    } catch (error) {
      LoggingService.error(error);
    }
    return undefined;
  }

  private addQueryToUrl({
    params,
    url,
  }: {
    params: Record<string, any> | undefined | null;
    url: string;
  }) {
    if (params && Object.keys(params)?.length) {
      const queryArray = Object.entries(params).map(([key, value]) => {
        return [key, value].join("=");
      });

      if (url.includes("?") && url.includes("=")) {
        return [url, queryArray.join("&")].join("&");
      }
      if (url.endsWith("?")) {
        return [url, queryArray.join("&")].join("");
      }
      return [url, queryArray.join("&")].join("?");
    }
    return url;
  }
}

export const HttpService = new HttpServiceBase();
