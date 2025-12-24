import { glamAuthControllerRefreshTokenMutationOptions } from "../../generated";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useCallback } from "react";

const ERROR_TYPE_SIGN_OUT = new Set([
  "refresh_token_expired_error",
  "refresh_token_reuse_error",
]);
const MAX_RETRY_COUNT = 3;

export const useGlamRefreshToken = () => {
  console.log("🚀 useGlamRefreshToken: Glam 리프레시 토큰 훅을 초기화합니다.");
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

  return useCallback((refreshToken: string) => {
    console.log("🔄 useGlamRefreshToken callback: 리프레시 토큰을 사용하여 토큰을 갱신합니다.", { refreshToken });
    const headers: Record<string, string> = {
      Authorization: `Bearer ${refreshToken}`,
    };
    if (__DEV__) {
      headers["cloudfront-viewer-country"] = "KR";
    }
    return refreshTokenApi({ headers });
  }, []);
};

// Alias for backward compatibility
export const useRefreshTokenApi = useGlamRefreshToken;
