import type { AxiosInstance } from "axios";

export type AxiosInspection = {
  baseURL?: string;
  headers?: any;
  timeout?: number;
  withCredentials?: boolean;
};

export function inspectAxios(instance: AxiosInstance): AxiosInspection {
  const d: any = instance.defaults ?? {};
  return {
    baseURL: d.baseURL,
    headers: d.headers,
    timeout: d.timeout,
    withCredentials: d.withCredentials,
  };
}

export default { inspectAxios };
