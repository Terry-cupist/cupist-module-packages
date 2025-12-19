import {
  ExpoNotificationResponse,
  parseExpoNotificationResponse,
  useNotificationManage,
} from "@cupist/notification-core";
import { ExpoNotificationModule } from "@shared/notification";
import { useEffect } from "react";
import { UseExpoHookCallbackType, UseFCMHookBaseProps } from "./types";

export const useExpoQuitClickResponseListener = (
  props?: UseFCMHookBaseProps<typeof parseExpoNotificationResponse> & {
    onClickResponse?: UseExpoHookCallbackType<
      typeof parseExpoNotificationResponse
    >;
  },
) => {
  const {
    onClickResponse,
    getValidNotificationData,
    dependencies = [],
  } = props ?? {};
  const { onLogNotificationEvent, onRefreshQueriesForDeepLink, onNavigateToDeepLink } =
    useNotificationManage(props);
  useEffect(() => {
    (async () => {
      console.log('🚪 [useExpoQuitClickResponseListener] 종료 상태 클릭 응답 확인 시작');
      const response =
        await ExpoNotificationModule.getLastNotificationResponseAsync();
      if (response) {
        console.log('👆 [useExpoQuitClickResponseListener] 종료 상태에서 클릭한 알림 발견');
        const parsedResponse = parseExpoNotificationResponse(
          response as ExpoNotificationResponse,
        );
        console.log('✅ [useExpoQuitClickResponseListener] 응답 파싱 완료:', parsedResponse);

        const validResponseData = getValidNotificationData
          ? getValidNotificationData(parsedResponse)
          : parsedResponse;
        console.log('✓ [useExpoQuitClickResponseListener] 유효성 검증 완료:', validResponseData);

        if (validResponseData.type) {
          console.log('📊 [useExpoQuitClickResponseListener] 이벤트 로깅:', validResponseData.type);
          onLogNotificationEvent(validResponseData.type);
        }

        if (validResponseData.deepLink) {
          console.log('🔗 [useExpoQuitClickResponseListener] 딥링크 발견:', validResponseData.deepLink);
          await onRefreshQueriesForDeepLink(validResponseData.deepLink);
          console.log('✅ [useExpoQuitClickResponseListener] 쿼리 갱신 완료');
          onNavigateToDeepLink(validResponseData.deepLink);
          console.log('🚀 [useExpoQuitClickResponseListener] 네비게이션 실행');
        }

        onClickResponse?.(validResponseData);
        console.log('✅ [useExpoQuitClickResponseListener] 클릭 응답 처리 완료');
      } else {
        console.log('ℹ️ [useExpoQuitClickResponseListener] 종료 상태에서 클릭한 알림 없음');
      }
    })();
  }, dependencies);
};
