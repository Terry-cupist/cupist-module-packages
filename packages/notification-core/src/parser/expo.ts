export interface ExpoNotification {
  request: {
    content: {
      body?: string;
      title?: string;
      data?: Record<string, any>;
    };
    trigger: NotificationTrigger;
  };
}

export interface NotificationTrigger {
  type: "push" | "timeInterval" | "calendar" | "location" | "unknown";
  payload?: NotificationPayload;
}

export interface NotificationPayload {
  ab_uri?: string;
  display?: string;
  type?: string;
  [key: string]: any;
}

export const parseExpoForegroundMessage = (message: ExpoNotification) => {
  console.log('📨 [parseExpoForegroundMessage] Expo 포그라운드 메시지 파싱 시작');
  const trigger = message.request.trigger;
  const displayJson = trigger?.payload?.display;
  console.log('🔍 [parseExpoForegroundMessage] 트리거 타입:', trigger.type);

  let deepLink = "";
  let content = message.request.content.body ?? "";
  let internalImage = "";
  let type = "";

  // Braze DeepLink 처리 --> 사용하는 단에서
  //   if (trigger.type === "push" && trigger.payload?.ab_uri) {
  //     deepLink = trigger.payload.ab_uri.toString();
  //   }

  if (trigger.type === "push") {
    console.log('📲 [parseExpoForegroundMessage] Push 타입 메시지 처리');
    if (displayJson) {
      console.log('🎨 [parseExpoForegroundMessage] Display JSON 파싱');
      const display = JSON.parse(displayJson);
      content = display.internal_body;
      deepLink = display.action;
      internalImage = display.internal_icon_path;
      console.log('✅ [parseExpoForegroundMessage] Display 데이터 추출 완료:', { content, deepLink, internalImage });
    }

    if (trigger.payload?.type) {
      type = trigger.payload.type as string;
      console.log('🏷️ [parseExpoForegroundMessage] 메시지 타입:', type);
    }
  }

  console.log('✅ [parseExpoForegroundMessage] 파싱 완료:', { deepLink, content, internalImage, type });
  return { deepLink, content, internalImage, type, raw: message };
};

export interface NotificationContent {
  data: {
    type?: string;
    action?: string;
  };
}

export interface ExpoNotificationResponse {
  notification: {
    request: {
      trigger: NotificationTrigger;
      content: NotificationContent;
    };
  };
}

export const parseExpoNotificationResponse = (
  response: ExpoNotificationResponse,
) => {
  console.log('👆 [parseExpoNotificationResponse] Expo 알림 응답 파싱 시작');
  let deepLink = "";
  let type = "";

  const trigger = response.notification.request.trigger;
  const contentData = response.notification.request.content.data;
  console.log('🔍 [parseExpoNotificationResponse] 트리거 타입:', trigger.type);

  if (trigger.type === "push") {
    console.log('📲 [parseExpoNotificationResponse] Push 타입 응답 처리');
    type = trigger?.payload?.type ?? "";

    const displayJson = trigger?.payload?.display;
    if (displayJson) {
      console.log('🎨 [parseExpoNotificationResponse] Display JSON 파싱');
      const data = JSON.parse(displayJson);
      deepLink = data.action;
      console.log('✅ [parseExpoNotificationResponse] 딥링크 추출 완료:', deepLink);
    }
  } else if (contentData) {
    console.log('📦 [parseExpoNotificationResponse] Content 데이터 처리');
    type = contentData.type ?? "";
    deepLink = contentData.action ?? "";
    console.log('✅ [parseExpoNotificationResponse] Content 데이터 추출 완료:', { type, deepLink });
  }

  console.log('✅ [parseExpoNotificationResponse] 파싱 완료:', { deepLink, type });
  return { deepLink, type, raw: response };
};
