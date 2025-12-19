export interface ReactNativeNotification {
  data: {
    type?: string;
    action?: string;
    [key: string]: string | number | undefined;
  };
}

export const parseReactNativeNotification = (
  notification: ReactNativeNotification,
) => {
  console.log('📨 [parseReactNativeNotification] React Native 알림 파싱 시작');
  const type = notification?.data?.type;
  const deepLink = notification?.data?.action;
  console.log('✅ [parseReactNativeNotification] 파싱 완료:', { type, deepLink });
  return { type, deepLink, raw: notification };
};
