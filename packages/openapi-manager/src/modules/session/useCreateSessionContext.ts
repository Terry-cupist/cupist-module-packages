import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  RevokeParams,
  SessionProviderProps,
  SessionState,
  UseCreateSessionContextResult,
} from "./types";

export const useCreateSessionContext = <T extends SessionState>({
  initialState,
  onGetAccessRefreshToken,
  onSignOutApi,
  onClearApiCache,
  onRemoveStoredValues,
  onNavigateAfterRevokeSession,
  onRevokeChat,
  onRevokeUserEvent,
  onRevokeNotification,
  onSetSessionLocalStorage,
  onInitSessionError,
  onGetExtraSessionLocalStorageState,
  onRequestRefreshTokenApi,
  onAfterRefreshToken,
  onRequestRefreshTokenError,
  onRequestRefreshTokenUI,
}: SessionProviderProps<T>): UseCreateSessionContextResult<T> => {
  const isTokenRefreshingRef = useRef(false);

  const [initialized, setInitialized] = useState(false);
  const [session, setSession] = useState<T>(initialState);
  const storeSession = useCallback(async (partialSession: Partial<T>) => {
    console.log("💾 storeSession: 세션 데이터를 저장합니다. ", {
      partialSession,
    });
    await onSetSessionLocalStorage?.(partialSession);
    setSession((prev) => ({ ...prev, ...partialSession }));
  }, []);

  const revokeSession = useCallback(
    async ({ session: _session, intended = true }: RevokeParams<T>) => {
      console.log("👋 revokeSession:  세션을 취소합니다. ", {
        session: _session,
        intended,
      });
      console.log("🧾 revokeSession: signout 가능 여부를 체크합니다.");
      if (session.accessToken && intended) {
        console.log("✅ revokeSession signout이 유효합니다!");
        try {
          await onSignOutApi();
        } catch (error) {
          // 로그아웃 실패 시 무시함
          console.log(
            "🚨 [useCreateSessionContext:revokeSession] 로그아웃 API 호출 실패",
            error,
          );
        }
      }

      try {
        console.log(
          "🗑️ [useCreateSessionContext:revokeSession] API 캐시 클리어",
        );
        onClearApiCache?.();

        console.log(
          "🗑️ [useCreateSessionContext:revokeSession] 저장된 값들 제거",
        );
        await onRemoveStoredValues?.();

        console.log(
          "💾 [useCreateSessionContext:revokeSession] 세션 초기 상태 저장",
        );
        storeSession(initialState);

        console.log("🚫 [useCreateSessionContext:revokeSession] 채팅 취소");
        onRevokeChat({ session: _session, intended });

        console.log(
          "🚫 [useCreateSessionContext:revokeSession] 사용자 이벤트 취소",
        );
        onRevokeUserEvent({ session: _session, intended });

        console.log("🚫 [useCreateSessionContext:revokeSession] 알림 취소");
        onRevokeNotification({ session: _session, intended });

        console.log(
          "🧭 [useCreateSessionContext:revokeSession] 세션 취소 후 네비게이션",
        );
        onNavigateAfterRevokeSession?.({ session: _session, intended });
      } catch (error) {
        console.log(
          "🚨 [useCreateSessionContext:revokeSession] 세션 취소 중 에러 발생",
          error,
        );
      }
    },
    [
      session.accessToken,
      onSignOutApi,
      onClearApiCache,
      onRemoveStoredValues,
      storeSession,
      onRevokeChat,
      onRevokeUserEvent,
      onRevokeNotification,
      onNavigateAfterRevokeSession,
    ],
  );

  const initSession = useCallback(async () => {
    console.log("🚀 initSession: 세션을 초기화합니다.");
    try {
      const { accessToken, refreshToken } = await onGetAccessRefreshToken();
      console.log(
        "⚙️ initSession: onGetAccessRefreshToken -> accessToken : ",
        accessToken,
      );
      console.log(
        "⚙️ initSession: onGetAccessRefreshToken -> refreshToken : ",
        refreshToken,
      );
      if (accessToken && refreshToken) {
        await storeSession({ accessToken, refreshToken } as Partial<T>);
      } else if (refreshToken) {
        // NOTE S2S에서 refreshToken이 없는경우를 고려하여 아래 추가했으나, DB migration 이후에는 refreshToken이 있는 것으로 간주해야 함
        await storeSession({ accessToken } as Partial<T>);
      }
    } catch (error) {
      console.log(
        "🚨 [useCreateSessionContext:initSession] 세션 초기화 에러",
        error,
      );
      if (error instanceof Error) {
        onInitSessionError(error);
      }
    } finally {
      const extraSessionState = await onGetExtraSessionLocalStorageState?.();
      await storeSession(extraSessionState);

      setInitialized(true);
    }
  }, [
    onGetAccessRefreshToken,
    storeSession,
    onInitSessionError,
    onGetExtraSessionLocalStorageState,
  ]);

  const requestRefreshToken = useCallback(
    async (
      onRefreshResultCallback?: (isSuccess: boolean) => void | Promise<void>,
    ) => {
      console.log("🔄 [requestRefreshToken]", { onRefreshResultCallback });
      if (isTokenRefreshingRef.current) {
        return;
      }
      isTokenRefreshingRef.current = true;

      try {
        console.log(
          "🔍 [useCreateSessionContext:requestRefreshToken] 현재 세션 상태",
          session,
        );
        const { accessToken, refreshToken } = await onRequestRefreshTokenApi(
          session.refreshToken,
        );
        await storeSession({ accessToken, refreshToken } as Partial<T>);

        onAfterRefreshToken?.();

        onRefreshResultCallback?.(true);
      } catch (error) {
        console.log(
          "🚨 [useCreateSessionContext:requestRefreshToken] 토큰 갱신 실패",
          error,
        );
        if (error instanceof Error) {
          onRequestRefreshTokenError(error);
        }

        revokeSession({ intended: false });
        onRefreshResultCallback?.(false);
        onRequestRefreshTokenUI?.();
      } finally {
        isTokenRefreshingRef.current = false;
      }
    },
    [
      session,
      onAfterRefreshToken,
      onRequestRefreshTokenApi,
      onRequestRefreshTokenError,
      onRequestRefreshTokenUI,
      revokeSession,
    ],
  );

  useEffect(() => {
    initSession();
    console.log("🚀 useCreateSessionContext: sessionContext를 생성합니다. ", {
      initialState,
      onGetAccessRefreshToken,
      onSignOutApi,
      onClearApiCache,
      onRemoveStoredValues,
      onNavigateAfterRevokeSession,
      onRevokeChat,
      onRevokeUserEvent,
      onRevokeNotification,
      onSetSessionLocalStorage,
      onInitSessionError,
      onGetExtraSessionLocalStorageState,
      onRequestRefreshTokenApi,
      onAfterRefreshToken,
      onRequestRefreshTokenError,
      onRequestRefreshTokenUI,
    });
  }, []);

  return useMemo(() => {
    /**
     * NOTE
     * - accessToken, refreshToken, userState, reviewState => 전체 서비스 공통
     * - rest => 각 서비스 별 추가 상태값
     */
    const { accessToken, refreshToken, userState, reviewState, ...rest } =
      session;
    return {
      ...rest,
      initialized,
      accessToken,
      refreshToken,
      userState,
      reviewState,
      storeSession,
      revokeSession,
      requestRefreshToken,
    } as UseCreateSessionContextResult<T>;
  }, [initialized, session, storeSession, revokeSession, requestRefreshToken]);
};
