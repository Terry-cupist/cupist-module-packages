import { UseFCMHookBaseProps } from "@app/hooks/types";
import {
  parseFCMQuitClickMessage,
  RemoteMessage,
  useNotificationManage,
} from "@cupist/notification-core";
import { getInitialNotification, messagingInstance } from "@shared/message";
import { useEffect } from "react";

export const useFCMQuitClickMessageListener = (
  props?: UseFCMHookBaseProps<typeof parseFCMQuitClickMessage>,
) => {
  const { dependencies = [], messaging = messagingInstance } = props ?? {};
  const { onOpenExternalLink, onLogNotificationEvent } = useNotificationManage(props);
  useEffect(() => {
    (async () => {
      console.log('🚪 [useFCMQuitClickMessageListener] 종료 상태 클릭 메시지 확인 시작');
      const message = await getInitialNotification(messaging);
      if (message) {
        console.log('👆 [useFCMQuitClickMessageListener] 종료 상태에서 클릭한 알림 발견');
        const parsedMessage = parseFCMQuitClickMessage(message as RemoteMessage);
        console.log('✅ [useFCMQuitClickMessageListener] 메시지 파싱 완료:', parsedMessage);

        if (parsedMessage.type) {
          console.log('📊 [useFCMQuitClickMessageListener] 이벤트 로깅:', parsedMessage.type);
          onLogNotificationEvent(parsedMessage.type);
        }

        if (parsedMessage.deepLink) {
          console.log('🔗 [useFCMQuitClickMessageListener] 외부 링크 열기:', parsedMessage.deepLink);
          onOpenExternalLink(parsedMessage.deepLink);
        }

        props?.onMessage?.(parsedMessage);
        console.log('✅ [useFCMQuitClickMessageListener] 종료 상태 클릭 메시지 처리 완료');
      } else {
        console.log('ℹ️ [useFCMQuitClickMessageListener] 종료 상태에서 클릭한 알림 없음');
      }
    })();
  }, dependencies);
};
