import {
  ExpoNotification,
  parseExpoForegroundMessage,
  useNotificationManage,
} from "@cupist/notification-core";
import { ExpoNotificationModule } from "@shared/notification";
import { useEffect } from "react";
import { UseExpoHookCallbackType, UseFCMHookBaseProps } from "./types";

type UseExpoForegroundNotificationListenerProps = UseFCMHookBaseProps<
  typeof parseExpoForegroundMessage
> & {
  onNotification?: UseExpoHookCallbackType<typeof parseExpoForegroundMessage>;
};

export const useExpoForegroundNotificationListener = (
  props?: UseExpoForegroundNotificationListenerProps,
) => {
  const {
    onNotification,
    getValidNotificationData,
    onRenderNotification: localOnRenderNotification,
    dependencies = [],
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
    console.log('🎧 [useExpoForegroundNotificationListener] 포그라운드 알림 리스너 등록');
    const subscription = ExpoNotificationModule.addNotificationReceivedListener(
      async (notification) => {
        console.log('📨 [useExpoForegroundNotificationListener] 포그라운드 알림 수신');
        const parsedNotification = parseExpoForegroundMessage(
          notification as ExpoNotification,
        );
        console.log('✅ [useExpoForegroundNotificationListener] 알림 파싱 완료:', parsedNotification);

        const validNotificationData = getValidNotificationData
          ? getValidNotificationData(parsedNotification)
          : parsedNotification;
        console.log('✓ [useExpoForegroundNotificationListener] 유효성 검증 완료:', validNotificationData);

        if (validNotificationData.deepLink) {
          console.log('🔗 [useExpoForegroundNotificationListener] 딥링크 발견, 쿼리 갱신:', validNotificationData.deepLink);
          await onRefreshQueriesForDeepLink(validNotificationData.deepLink);
          console.log('✅ [useExpoForegroundNotificationListener] 쿼리 갱신 완료');
        }

        const isNotificationUIOpenValid =
          shouldShowNotification?.(validNotificationData) ?? true;
        console.log('🎨 [useExpoForegroundNotificationListener] UI 표시 여부:', isNotificationUIOpenValid);

        if (isNotificationUIOpenValid) {
          console.log('🚀 [useExpoForegroundNotificationListener] 알림 UI 표시 시작');
          onBeforeShowNotification?.(validNotificationData);

          if (localOnRenderNotification) {
            console.log('🎯 [useExpoForegroundNotificationListener] 로컬 렌더러 사용');
            localOnRenderNotification?.(validNotificationData);

            onAfterShowNotification?.(validNotificationData);
            console.log('✅ [useExpoForegroundNotificationListener] 로컬 렌더링 완료');
          } else {
            console.log('🎯 [useExpoForegroundNotificationListener] 기본 렌더러 사용');
            onRenderNotification({
              ...validNotificationData,
              onPress: () => {
                console.log('👆 [useExpoForegroundNotificationListener] 알림 클릭됨');
                onNotificationPress?.(validNotificationData);

                if (validNotificationData.type) {
                  console.log('📊 [useExpoForegroundNotificationListener] 이벤트 로깅:', validNotificationData.type);
                  onLogNotificationEvent(validNotificationData.type);
                }
                if (validNotificationData.deepLink) {
                  console.log('🔗 [useExpoForegroundNotificationListener] 딥링크 네비게이션:', validNotificationData.deepLink);
                  onNavigateToDeepLink(validNotificationData.deepLink);
                }

                onAfterShowNotification?.(validNotificationData);
                console.log('✅ [useExpoForegroundNotificationListener] 클릭 처리 완료');
              },
            });
          }
        }

        console.log('🔔 [useExpoForegroundNotificationListener] 배지 카운트 갱신');
        onRefreshBadgeCount();

        onNotification?.(validNotificationData);
        console.log('✅ [useExpoForegroundNotificationListener] 알림 처리 완료');
      },
    );
    return () => {
      console.log('🔌 [useExpoForegroundNotificationListener] 리스너 구독 해제');
      subscription.remove();
    };
  }, dependencies);
};
