import { UseFCMHookBaseProps } from "@app/hooks/types";
import {
  parseFCMBackgroundMessage,
  RemoteMessage,
  useNotificationManage,
} from "@cupist/notification-core";
import {
  messagingInstance,
  setBackgroundMessageHandler,
} from "@shared/message";
import { useEffect } from "react";

export const useFCMBackgroundMessageListener = (
  props?: UseFCMHookBaseProps<typeof parseFCMBackgroundMessage>,
) => {
  const { dependencies = [], messaging = messagingInstance } = props ?? {};
  const { onDisplayLocalNotification } = useNotificationManage(props);

  useEffect(() => {
    console.log('🎧 [useFCMBackgroundMessageListener] FCM 백그라운드 메시지 핸들러 설정');
    setBackgroundMessageHandler(messaging, async (message) => {
      console.log('📨 [useFCMBackgroundMessageListener] 백그라운드 메시지 수신');
      const parsedMessage = parseFCMBackgroundMessage(message as RemoteMessage);
      console.log('✅ [useFCMBackgroundMessageListener] 메시지 파싱 완료:', parsedMessage);

      const {
        title = "",
        message: content = "",
        largeIconUrl = "",
        display,
      } = parsedMessage;

      if (display) {
        console.log('🔔 [useFCMBackgroundMessageListener] 로컬 알림 표시:', { title, content, largeIconUrl });
        onDisplayLocalNotification(
          { title, message: content, largeIconUrl },
          display,
        );
        console.log('✅ [useFCMBackgroundMessageListener] 로컬 알림 표시 완료');
      } else {
        console.log('ℹ️ [useFCMBackgroundMessageListener] Display 데이터 없음, 로컬 알림 미표시');
      }

      props?.onMessage?.(parsedMessage);
      console.log('✅ [useFCMBackgroundMessageListener] 백그라운드 메시지 처리 완료');
    });
  }, dependencies);
};
