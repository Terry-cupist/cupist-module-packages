import { OpenApiClient } from "@/core/client";
import { useNetInfo } from "@react-native-community/netinfo";
import { AxiosInstance } from "axios";
import { useEffect, useState } from "react";

export type DefaultApiClientType = {
  instance: AxiosInstance;
  setConfig: (config: any) => void;
  getConfig: () => any;
  request: (config: any) => Promise<any>;
};

export type UseApiClientMangerProps<T extends DefaultApiClientType> = {
  client: OpenApiClient<T>;
  baseURL: string;
  token: string;
  notRequireRetryUrls: Set<string>;
  notRequireAuthorizationUrls: Set<string>;
  requireUpdateErrorTypes: Set<string>;
  onAuthErrorCallback?: () => Promise<void>;
  onNetworkErrorCallback?: (error: any) => void;
  onSystemErrorCallback?: (description?: string) => void;
};

export const useApiClientManager = <T extends DefaultApiClientType>({
  client,
  baseURL,
  token,
  notRequireRetryUrls,
  notRequireAuthorizationUrls,
  requireUpdateErrorTypes,
  onAuthErrorCallback,
  onNetworkErrorCallback,
  onSystemErrorCallback,
}: UseApiClientMangerProps<T>) => {
  if (!client || !baseURL) {
    throw new Error(
      `[ApiClientManger] ${client ? "baseURL" : "client"} prop must be provided.`,
    );
  }

  const [initialized, setInitialized] = useState(false);
  const netInfo = useNetInfo();

  useEffect(() => {
    client.setConfig({ baseURL });
    client.setNotRequireRetryUrls(notRequireRetryUrls);
    client.setNotRequireAuthorizationUrls(notRequireAuthorizationUrls);
    client.setRequireUpdateErrorTypes(requireUpdateErrorTypes);
    setInitialized(true);
  }, [
    baseURL,
    notRequireRetryUrls,
    notRequireAuthorizationUrls,
    requireUpdateErrorTypes,
  ]);

  useEffect(() => {
    if (onAuthErrorCallback) {
      client.setOnAuthErrorCallback(onAuthErrorCallback);
    }
  }, [onAuthErrorCallback]);

  useEffect(() => {
    if (onNetworkErrorCallback) {
      client.setOnNetworkErrorCallback(onNetworkErrorCallback);
    }
  }, [onNetworkErrorCallback]);

  useEffect(() => {
    if (onSystemErrorCallback) {
      client.setOnSystemErrorCallback(onSystemErrorCallback);
    }
  }, [onSystemErrorCallback]);

  useEffect(() => {
    if (netInfo.isConnected !== null) {
      client.setIsNetworkConnected(netInfo.isConnected);
    }
  }, [netInfo.isConnected]);

  useEffect(() => {
    console.log(
      "🔄 useApiClientManager: Auth Token이 변경되었습니다. [:$3]",
      token,
    );
    client.setAuthToken(token);
  }, [token]);

  return { initialized };
};
