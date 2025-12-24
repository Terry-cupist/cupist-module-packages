import {
  glamAuthControllerRefreshTokenMutationOptions,
  glamAuthControllerSignOutMutationOptions,
} from "@/glam";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useCallback } from "react";

const ERROR_TYPE_SIGN_OUT = new Set([
  "refresh_token_expired_error",
  "refresh_token_reuse_error",
]);
const MAX_RETRY_COUNT = 3;

export const useSignOutApi = () => {
  const { mutationFn } = glamAuthControllerSignOutMutationOptions();
  const { mutateAsync: signOutApi } = useMutation({ mutationFn });
  return useCallback(() => signOutApi({}), []);
};

export const useRefreshTokenApi = () => {
  const { mutationFn } = glamAuthControllerRefreshTokenMutationOptions();
  const { mutateAsync: refreshTokenApi } = useMutation({
    mutationFn,
    retry: (failureCount, error) => {
      console.log("🐛 refreshTokenApi retry: ", failureCount);
      if (
        error instanceof AxiosError &&
        ERROR_TYPE_SIGN_OUT.has(error.response?.data?.content?.type)
      ) {
        console.log("🐛 refreshTokenApi retry: ", failureCount);
        return false;
      }

      if (failureCount >= MAX_RETRY_COUNT - 1) {
        return false;
      }

      return true;
    },
    retryDelay: 500,
  });

  /**
   * NOTE
   * - 현재 토큰 리프레쉬 API에 security: [{ jwt: [] }]이 없음.
   * - security 설정이 없으면 openapi 생성시 토큰 주입을 하지 않음.
   * - params spec에도 refreshToken이 없기 때문에 헤더를 직접 주입하였음.
   */
  return useCallback((refreshToken: string) => {
    const headers = { Authorization: `Bearer ${refreshToken}` };
    if (__DEV__) {
      Object.assign(headers, { "cloudfront-viewer-country": "KR" });
    }
    return refreshTokenApi({ headers });
  }, []);
};
