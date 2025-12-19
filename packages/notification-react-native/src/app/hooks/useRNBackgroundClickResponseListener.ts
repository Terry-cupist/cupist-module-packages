import {
  parseReactNativeNotification,
  useNotificationManage,
} from "@cupist/notification-core";
import { RNNotificationModule } from "@shared/notification";
import { useEffect } from "react";
import { UseRNHookBaseProps } from "./types";

export const useRNBackgroundClickResponseListener = (
  props?: UseRNHookBaseProps<typeof parseReactNativeNotification>,
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
    console.log('⚙️ [useRNBackgroundClickResponseListener] React Native 알림 리스너 설정');
    RNNotificationModule.configure({
      onNotification: async (notification) => {
        console.log('👆 [useRNBackgroundClickResponseListener] 백그라운드 알림 클릭됨');
        const parsedNotification = parseReactNativeNotification(notification);
        console.log('✅ [useRNBackgroundClickResponseListener] 알림 파싱 완료:', parsedNotification);

        const validNotificationData = getValidNotificationData
          ? getValidNotificationData?.(parsedNotification)
          : parsedNotification;
        console.log('✓ [useRNBackgroundClickResponseListener] 유효성 검증 완료:', validNotificationData);

        if (validNotificationData.type) {
          console.log('📊 [useRNBackgroundClickResponseListener] 이벤트 로깅:', validNotificationData.type);
          onLogNotificationEvent(validNotificationData.type);
        }

        if (validNotificationData.deepLink) {
          console.log('🔗 [useRNBackgroundClickResponseListener] 딥링크 발견:', validNotificationData.deepLink);
          await onRefreshQueriesForDeepLink(validNotificationData.deepLink);
          console.log('✅ [useRNBackgroundClickResponseListener] 쿼리 갱신 완료');
          onNavigateToDeepLink(validNotificationData.deepLink);
          console.log('🚀 [useRNBackgroundClickResponseListener] 네비게이션 실행');
        }

        onClickResponse?.(parsedNotification);
        console.log('✅ [useRNBackgroundClickResponseListener] 클릭 응답 처리 완료');
      },
    });
  }, dependencies);
};
