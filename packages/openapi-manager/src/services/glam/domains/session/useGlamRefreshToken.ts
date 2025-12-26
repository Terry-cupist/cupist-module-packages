import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useCallback } from "react";
import { glamAuthControllerRefreshTokenMutationOptions } from "../../generated";

const ERROR_TYPE_SIGN_OUT = new Set([
  "refresh_token_expired_error",
  "refresh_token_reuse_error",
]);
const MAX_RETRY_COUNT = 3;

export const useGlamRefreshToken = () => {
  const { mutationFn } = glamAuthControllerRefreshTokenMutationOptions();
  const { mutateAsync: refreshTokenApi } = useMutation({
    mutationFn,
    retry: (failureCount, error) => {
      if (
        error instanceof AxiosError &&
        ERROR_TYPE_SIGN_OUT.has(error.response?.data?.content?.type)
      ) {
        console.log(
          "🛑 refreshTokenApi 재시도를 종료합니다. (리프레쉬 토큰 만료) [재시도 횟수 ]",
          failureCount,
        );
        return false;
      }

      if (failureCount >= MAX_RETRY_COUNT - 1) {
        console.log(
          "🛑 refreshTokenApi 재시도를 종료합니다. (최대 횟수 초과) [재시도 횟수 ]",
          failureCount,
        );
        return false;
      }

      return true;
    },
    retryDelay: 500,
  });

  return useCallback((refreshToken: string) => {
    console.log("🔄 useGlamRefreshToken [callback]", { refreshToken });
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
