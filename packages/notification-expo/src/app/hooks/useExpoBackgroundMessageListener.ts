import {
  parseFCMBackgroundMessage,
  RemoteMessage,
} from "@cupist/notification-core";
import { ExpoNotificationModule } from "@shared/notification";
import { useEffect } from "react";
import { Platform } from "react-native";
import { UseFCMHookBaseProps } from "./types";

type UseExpoBackgroundMessageListenerProps = UseFCMHookBaseProps<
  typeof parseFCMBackgroundMessage
> & {
  /**
   * FCM 백그라운드 메시지를 받았을 때 Expo 로컬 알림을 표시하는 함수
   * @param params - 알림 표시 파라미터 (title, message, largeIconUrl)
   * @param display - 알림 메타데이터 (deepLink, type 등)
   */
  onDisplayExpoLocalNotification: (
    params: { title: string; message: string; largeIconUrl?: string },
    display: any,
  ) => Promise<void>;
};

export const useExpoBackgroundMessageListener = (
  props: UseExpoBackgroundMessageListenerProps,
) => {
  const { dependencies = [], onDisplayExpoLocalNotification } = props;

  useEffect(() => {
    // Android만 처리 (iOS는 FCM이 자동으로 시스템 알림 표시)
    if (Platform.OS !== "android") {
      console.log(
        "ℹ️ [useExpoBackgroundMessageListener] iOS는 FCM 자동 처리로 인해 스킵",
      );
      return;
    }

    console.log(
      "🎧 [useExpoBackgroundMessageListener] Expo 백그라운드 메시지 리스너 등록 (Android만)",
    );

    // FCM setBackgroundMessageHandler는 entry.ts의 Headless Task에서 처리
    // 이 훅은 React 컨텍스트에서 실행되므로 추가 처리만 담당
    console.log(
      "ℹ️ [useExpoBackgroundMessageListener] FCM 백그라운드 메시지는 entry.ts Headless Task에서 처리",
    );
    console.log(
      "ℹ️ [useExpoBackgroundMessageListener] 이 훅은 onDisplayExpoLocalNotification 함수만 제공",
    );

    // 실제 FCM 메시지 처리는 entry.ts의 registerHeadlessTask에서 수행
    // 이 훅은 React 컨텍스트 내에서 실행되므로 cleanup만 담당
    return () => {
      console.log(
        "🔌 [useExpoBackgroundMessageListener] 리스너 정리 (실제 FCM은 Headless Task 처리)",
      );
    };
  }, dependencies);
};
