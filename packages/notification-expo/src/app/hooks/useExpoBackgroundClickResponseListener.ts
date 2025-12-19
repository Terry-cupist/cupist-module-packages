import {
  ExpoNotificationResponse,
  parseExpoNotificationResponse,
  useNotificationManage,
} from "@cupist/notification-core";
import { ExpoNotificationModule } from "@shared/notification";
import { useEffect } from "react";
import { UseExpoHookCallbackType, UseFCMHookBaseProps } from "./types";

export const useExpoBackgroundClickResponseListener = (
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
  const {
    onLogNotificationEvent,
    onRefreshQueriesForDeepLink,
    onNavigateToDeepLink,
  } = useNotificationManage(props);
  useEffect(() => {
    console.log('🎧 [useExpoBackgroundClickResponseListener] 백그라운드 클릭 리스너 등록');
    const subscription =
      ExpoNotificationModule.addNotificationResponseReceivedListener(
        async (response) => {
          if (response) {
            console.log('👆 [useExpoBackgroundClickResponseListener] 백그라운드 알림 클릭됨');
            const parsedResponse = parseExpoNotificationResponse(
              response as ExpoNotificationResponse,
            );
            console.log('✅ [useExpoBackgroundClickResponseListener] 응답 파싱 완료:', parsedResponse);

            const validNotificationData = getValidNotificationData
              ? getValidNotificationData(parsedResponse)
              : parsedResponse;
            console.log('✓ [useExpoBackgroundClickResponseListener] 유효성 검증 완료:', validNotificationData);

            if (validNotificationData.type) {
              console.log('📊 [useExpoBackgroundClickResponseListener] 이벤트 로깅:', validNotificationData.type);
              onLogNotificationEvent(validNotificationData.type);
            }

            if (validNotificationData.deepLink) {
              console.log('🔗 [useExpoBackgroundClickResponseListener] 딥링크 발견:', validNotificationData.deepLink);
              await onRefreshQueriesForDeepLink(validNotificationData.deepLink);
              console.log('✅ [useExpoBackgroundClickResponseListener] 쿼리 갱신 완료');
              onNavigateToDeepLink(validNotificationData.deepLink);
              console.log('🚀 [useExpoBackgroundClickResponseListener] 네비게이션 실행');
            }

            onClickResponse?.(validNotificationData);
            console.log('✅ [useExpoBackgroundClickResponseListener] 클릭 응답 처리 완료');
          }
        },
      );
    return () => {
      console.log('🔌 [useExpoBackgroundClickResponseListener] 리스너 구독 해제');
      subscription.remove();
    };
  }, dependencies);
};
