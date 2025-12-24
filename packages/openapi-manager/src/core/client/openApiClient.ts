import { AxiosError, AxiosInstance } from "axios";
import ApiError, { HttpStatus } from "../error/apiError";

const SECOND = 1000;

export type OpenApiClientConstructorParams<
  T extends {
    instance: AxiosInstance;
    setConfig: (config: any) => void;
    getConfig: () => any;
    request: (config: any) => Promise<any>;
  },
> = {
  client: T;
  notRequireRetryUrls?: Set<string>;
  notRequireAuthorizationUrls?: Set<string>;
  requireUpdateErrorTypes?: Set<string>;
  onSystemErrorCallback?: (description?: string) => void;
  onAuthErrorCallback?: () => Promise<void>;
  onNetworkErrorCallback?: (error: AxiosError) => void;
  onNonAxiosErrorCallback?: (error: any) => void;
};

export type RetryRequest = {
  retry: () => void | Promise<void>;
  cancel: () => void | Promise<void>;
};

export class OpenApiClient<
  T extends {
    instance: AxiosInstance;
    setConfig: (config: any) => void;
    getConfig: () => any;
    request: (config: any) => Promise<any>;
  },
> {
  public client: T;

  private retryRequestQueue: RetryRequest[] = [];

  private notRequireRetryUrls = new Set<string>([]);
  private notRequireAuthorizationUrls = new Set<string>([]);
  private requireUpdateErrorTypes = new Set<string>([]);

  private networkErrorTimeout: ReturnType<typeof setTimeout> | null = null;
  private networkErrorResolved = true;
  private isNetworkConnected = true;

  private onSystemErrorCallback?: (description?: string) => void;
  private onAuthErrorCallback?: () => Promise<void>;
  private onNetworkErrorCallback?: (error: AxiosError) => void;
  private onNonAxiosErrorCallback?: (error: any) => void;

  constructor({
    client,
    notRequireRetryUrls,
    notRequireAuthorizationUrls,
    requireUpdateErrorTypes,
    onSystemErrorCallback,
    onAuthErrorCallback,
    onNetworkErrorCallback,
    onNonAxiosErrorCallback,
  }: OpenApiClientConstructorParams<T>) {
    this.client = client;

    if (notRequireRetryUrls) {
      this.setNotRequireRetryUrls(notRequireRetryUrls);
    }
    if (notRequireAuthorizationUrls) {
      this.setNotRequireAuthorizationUrls(notRequireAuthorizationUrls);
    }
    if (requireUpdateErrorTypes) {
      this.setRequireUpdateErrorTypes(requireUpdateErrorTypes);
    }

    if (onSystemErrorCallback) {
      this.setOnSystemErrorCallback(onSystemErrorCallback);
    }
    if (onAuthErrorCallback) {
      this.setOnAuthErrorCallback(onAuthErrorCallback);
    }
    if (onNetworkErrorCallback) {
      this.setOnNetworkErrorCallback(onNetworkErrorCallback);
    }
    if (onNonAxiosErrorCallback) {
      this.setOnNonAxiosErrorCallback(onNonAxiosErrorCallback);
    }

    this.setRequestInterceptor();
    this.setResponseInterceptor();
  }

  public setConfig(config: any) {
    this.client.setConfig(config);
  }

  public setAuthToken(token: string | (() => string | Promise<string>)) {
    this.client.setConfig({ auth: token });
  }

  public setIsNetworkConnected(isConnected: boolean) {
    this.isNetworkConnected = isConnected;
  }

  public setNotRequireRetryUrls(urls: Set<string>) {
    const config = this.client.getConfig();
    this.notRequireRetryUrls = new Set(
      [...urls].map((url) => config.baseURL + url),
    );
  }

  public setNotRequireAuthorizationUrls(urls: Set<string>) {
    const config = this.client.getConfig();
    this.notRequireAuthorizationUrls = new Set(
      [...urls].map((url) => config.baseURL + url),
    );
  }

  public setRequireUpdateErrorTypes(types: Set<string>) {
    this.requireUpdateErrorTypes = types;
  }

  public setOnSystemErrorCallback(callback: (description?: string) => void) {
    this.onSystemErrorCallback = callback;
  }

  public setOnAuthErrorCallback(callback: () => Promise<void>) {
    this.onAuthErrorCallback = callback;
  }

  public setOnNetworkErrorCallback(callback: (error: AxiosError) => void) {
    this.onNetworkErrorCallback = callback;
  }

  public setOnNonAxiosErrorCallback(callback: (error: any) => void) {
    this.onNonAxiosErrorCallback = callback;
  }

  public flush(command: "retry" | "cancel") {
    while (this.retryRequestQueue.length > 0) {
      const retryRequest = this.retryRequestQueue.shift();
      if (command === "retry") {
        retryRequest?.retry();
      } else if (command === "cancel") {
        retryRequest?.cancel();
      }
    }
  }

  private checkAuthorizationRequired(url?: string) {
    return url && !this.notRequireAuthorizationUrls.has(url);
  }

  private checkIsTokenRefreshRequired = (error: AxiosError<any>) => {
    const { config } = error;
    return (
      !this.notRequireRetryUrls.has(config?.url as string) &&
      error.response?.status === HttpStatus.UNAUTHORIZED &&
      this.requireUpdateErrorTypes.has(error.response.data?.content?.type)
    );
  };

  private handleSystemError(error: any) {
    const description = error.response?.data?.content?.description;
    this.onSystemErrorCallback?.(description);
  }

  private handleNetworkError(error: any) {
    if (!this.networkErrorTimeout) {
      this.networkErrorResolved = false;
      this.networkErrorTimeout = setTimeout(() => {
        if (!this.networkErrorResolved) {
          this.networkErrorTimeout = null;
          this.onNetworkErrorCallback?.(error);
        }
      }, 3 * SECOND);
    }

    return this.pushRetryRequest(error);
  }

  private handleAuthError(error: any) {
    this.onAuthErrorCallback?.();
    return this.pushRetryRequest(error);
  }

  private pushRetryRequest = (error: any) => {
    return new Promise((resolve, reject) => {
      this.retryRequestQueue.push({
        retry: async () => {
          try {
            const response = await this.client.request({
              ...error.config,
              headers: {
                ...error.config.headers,
                ...this.client.getConfig().headers,
              },
            });
            resolve(response);
          } catch (retryError) {
            reject(retryError);
          }
        },
        cancel: () => reject(error),
      });
    });
  };

  private setRequestInterceptor() {
    this.client.instance.interceptors.request.use(
      (config) => {
        if (
          this.client.getConfig().auth &&
          this.checkAuthorizationRequired(config.url)
        ) {
          Object.assign(config.headers, {
            Authorization: `bearer ${this.client.getConfig().auth}`,
          });
        }
        return config;
      },
      (error) => console.error(error),
    );
  }

  private setResponseInterceptor() {
    this.client.instance.interceptors.response.use(
      (response) => {
        if (this.networkErrorTimeout) {
          clearTimeout(this.networkErrorTimeout);
          this.networkErrorTimeout = null;
          this.networkErrorResolved = true;
        }
        return response;
      },
      (error) => {
        console.log("🐛 response interceptor error: ", error);
        const isNotAxiosError = !(error instanceof AxiosError);
        if (isNotAxiosError) {
          this.onNonAxiosErrorCallback?.(error);
        }

        const isBadRequest = error.response?.status === HttpStatus.BAD_REQUEST;
        const isMaintenance =
          error.response?.data?.content?.type === "maintenance";
        const isSystemError = isBadRequest && isMaintenance;
        if (isSystemError) {
          return this.handleSystemError(error);
        }

        const isNetworkUnconnectedError = error.message === "Network Error";
        if (isNetworkUnconnectedError && !this.isNetworkConnected) {
          return this.handleNetworkError(error);
        }

        if (this.checkIsTokenRefreshRequired(error)) {
          return this.handleAuthError(error);
        }

        throw new ApiError(error);
      },
    );
  }
}

export const createOpenApiClientModule = <
  T extends {
    instance: AxiosInstance;
    setConfig: (config: any) => void;
    getConfig: () => any;
    request: (config: any) => Promise<any>;
  },
>(
  params: OpenApiClientConstructorParams<T>,
) => {
  const client = new OpenApiClient(params);
  return client;
};
