import { UseFCMHookBaseProps } from "@app/hooks/types";
import {
  parseFCMBackgroundClickMessage,
  RemoteMessage,
  useNotificationManage,
} from "@cupist/notification-core";
import { messagingInstance, onNotificationOpenedApp } from "@shared/message";
import { useEffect } from "react";

export const useFCMBackgroundClickMessageListener = (
  props?: UseFCMHookBaseProps<typeof parseFCMBackgroundClickMessage>,
) => {
  const { dependencies = [], messaging = messagingInstance } = props ?? {};
  const { onOpenExternalLink, onLogNotificationEvent } = useNotificationManage(props);

  useEffect(() => {
    console.log('🎧 [useFCMBackgroundClickMessageListener] FCM 백그라운드 클릭 리스너 등록');
    const unsubscribe = onNotificationOpenedApp(messaging, (message) => {
      console.log('👆 [useFCMBackgroundClickMessageListener] 백그라운드 알림 클릭됨');
      const parsedMessage = parseFCMBackgroundClickMessage(
        message as RemoteMessage,
      );
      console.log('✅ [useFCMBackgroundClickMessageListener] 메시지 파싱 완료:', parsedMessage);

      if (parsedMessage.type) {
        console.log('📊 [useFCMBackgroundClickMessageListener] 이벤트 로깅:', parsedMessage.type);
        onLogNotificationEvent(parsedMessage.type);
      }

      if (parsedMessage.deepLink) {
        console.log('🔗 [useFCMBackgroundClickMessageListener] 외부 링크 열기:', parsedMessage.deepLink);
        onOpenExternalLink(parsedMessage.deepLink);
      }

      props?.onMessage?.(parsedMessage);
      console.log('✅ [useFCMBackgroundClickMessageListener] 클릭 메시지 처리 완료');
    });
    return () => {
      console.log('🔌 [useFCMBackgroundClickMessageListener] 리스너 구독 해제');
      unsubscribe();
    };
  }, dependencies);
};
