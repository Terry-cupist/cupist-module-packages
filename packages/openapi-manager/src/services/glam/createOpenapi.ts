import { getInitialClientConfigMethod } from "@core/config";
import "react-native-polyfill-globals/auto";
import { CreateClientConfig } from "./generated/client";

// NOTE: 초기 client config 세팅 함수 가이드에 따른 export 선언
//  REF: https://heyapi.dev/openapi-ts/clients/axios > Runtime API 섹션
export const createClientConfig =
  getInitialClientConfigMethod<CreateClientConfig>();
