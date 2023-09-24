import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

export async function callApi<R, P = unknown>(config: AxiosRequestConfig<P>): Promise<R> {
  return axios
    .request<unknown, AxiosResponse<R>, AxiosRequestConfig<P>>({ timeout: 60 * 3 * 1000, ...config })
    .then((resp) => {
      return resp.data;
    })
    .catch((error: AxiosError) => Promise.reject(error));
}
