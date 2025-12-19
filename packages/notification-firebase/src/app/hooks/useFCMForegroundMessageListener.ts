import {
  parseFCMForegroundMessage,
  RemoteMessage,
  useNotificationManage,
} from "@cupist/notification-core";
import { messagingInstance, onMessage } from "@shared/message";
import { useEffect } from "react";
import { UseFCMHookBaseProps } from "./types";

export const useFCMForegroundMessageListener = (
  props?: UseFCMHookBaseProps<typeof parseFCMForegroundMessage>,
) => {
  const {
    getValidNotificationData,
    dependencies = [],
    onRenderNotification: localOnRenderNotification,
    messaging = messagingInstance,
  } = props ?? {};
  const {
    onRefreshQueriesForDeepLink,
    onRefreshBadgeCount,
    shouldShowNotification,
    onBeforeShowNotification,
    onRenderNotification,
    onNotificationPress,
    onAfterShowNotification,
    onNavigateToDeepLink,
    onLogNotificationEvent,
  } = useNotificationManage(props);

  useEffect(() => {
    console.log('🎧 [useFCMForegroundMessageListener] FCM 포그라운드 메시지 리스너 등록');
    const unsubscribe = onMessage(messaging, async (message) => {
      console.log('📨 [useFCMForegroundMessageListener] 포그라운드 메시지 수신');
      const parsedMessage = parseFCMForegroundMessage(message as RemoteMessage);
      console.log('✅ [useFCMForegroundMessageListener] 메시지 파싱 완료:', parsedMessage);

      const validNotificationData = getValidNotificationData
        ? getValidNotificationData(parsedMessage)
        : parsedMessage;
      console.log('✓ [useFCMForegroundMessageListener] 유효성 검증 완료:', validNotificationData);

      if (validNotificationData.deepLink) {
        console.log('🔗 [useFCMForegroundMessageListener] 딥링크 발견, 쿼리 갱신:', validNotificationData.deepLink);
        await onRefreshQueriesForDeepLink(validNotificationData.deepLink);
        console.log('✅ [useFCMForegroundMessageListener] 쿼리 갱신 완료');
      }

      const isNotificationUIOpenValid =
        shouldShowNotification?.(validNotificationData) ?? true;
      console.log('🎨 [useFCMForegroundMessageListener] UI 표시 여부:', isNotificationUIOpenValid);

      if (isNotificationUIOpenValid) {
        console.log('🚀 [useFCMForegroundMessageListener] 알림 UI 표시 시작');
        onBeforeShowNotification?.(validNotificationData);

        if (localOnRenderNotification) {
          console.log('🎯 [useFCMForegroundMessageListener] 로컬 렌더러 사용');
          localOnRenderNotification?.(validNotificationData);

          onAfterShowNotification?.(validNotificationData);
          console.log('✅ [useFCMForegroundMessageListener] 로컬 렌더링 완료');
        } else {
          console.log('🎯 [useFCMForegroundMessageListener] 기본 렌더러 사용');
          onRenderNotification({
            ...validNotificationData,
            onPress: () => {
              console.log('👆 [useFCMForegroundMessageListener] 알림 클릭됨');
              onNotificationPress?.(validNotificationData);

              if (validNotificationData.type) {
                console.log('📊 [useFCMForegroundMessageListener] 이벤트 로깅:', validNotificationData.type);
                onLogNotificationEvent(validNotificationData.type);
              }
              if (validNotificationData.deepLink) {
                console.log('🔗 [useFCMForegroundMessageListener] 딥링크 네비게이션:', validNotificationData.deepLink);
                onNavigateToDeepLink(validNotificationData.deepLink);
              }

              onAfterShowNotification?.(validNotificationData);
              console.log('✅ [useFCMForegroundMessageListener] 클릭 처리 완료');
            },
          });
        }
      }

      console.log('🔔 [useFCMForegroundMessageListener] 배지 카운트 갱신');
      onRefreshBadgeCount();

      props?.onMessage?.(parsedMessage);
      console.log('✅ [useFCMForegroundMessageListener] 메시지 처리 완료');
    });
    return () => {
      console.log('🔌 [useFCMForegroundMessageListener] 리스너 구독 해제');
      unsubscribe();
    };
  }, dependencies);
};
