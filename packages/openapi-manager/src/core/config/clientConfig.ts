import { Platform } from "react-native";
import DeviceInfo from "react-native-device-info";

export type ConfigParam<T> = T extends (
  config: infer Config,
  ...args: any[]
) => any
  ? Config
  : never;

// NOTE: 초기 client config 세팅 함수 가이드에 따른 export 선언
//  REF: https://heyapi.dev/openapi-ts/clients/axios > Runtime API 섹션
export const getInitialClientConfigMethod = <
  T extends (config: ConfigParam<T>, ...args: any[]) => any,
>(
  customConfig?: ConfigParam<T>,
) => {
  return ((config: ConfigParam<T>) => ({
    ...config,
    headers: {
      "device-type": Platform.select({
        ios: "ios",
        android: "android",
        default: "web",
      }),
      "device-name": DeviceInfo.getModel(),
      "device-app-version": DeviceInfo.getBuildNumber(),
      "device-os-version": DeviceInfo.getSystemVersion(),
      "device-identification": DeviceInfo.getUniqueIdSync(),
      "Cache-Control": "no-cache",
    },
    timeout: 60000,
    ...customConfig,
  })) as T;
};
