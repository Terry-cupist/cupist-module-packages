export interface RemoteMessage {
  data?: {
    type?: string;
    display?: string;
    a?: string | number;
    uri?: string;
    [key: string]: string | number | undefined;
  };
  notification?: {
    title?: string;
    body?: string;
    image?: string;
  };
  messageId?: string;
  from?: string;
  collapseKey?: string;
  sentTime?: number;
}

export interface DisplayJSON {
  title?: string;
  body?: string;
  icon_path?: string;
  internal_title?: string;
  internal_body?: string;
  internal_icon_path?: string;
  action?: string;
  type?: string;
}

export const parseFCMForegroundMessage = (message: RemoteMessage) => {
  console.log('📨 [parseFCMForegroundMessage] FCM 포그라운드 메시지 파싱 시작');
  let content = "";
  let deepLink = "";
  let internalImage = "";
  const type = message.data?.type as string;
  console.log('🏷️ [parseFCMForegroundMessage] 메시지 타입:', type);

  if (message.data?.display) {
    console.log('🎨 [parseFCMForegroundMessage] Display 데이터 파싱');
    const display = JSON.parse(message.data.display as string);
    content = display.internal_body;
    deepLink = display.action;
    internalImage = display.internal_icon_path;
    console.log('✅ [parseFCMForegroundMessage] Display 데이터 추출 완료:', { content, deepLink, internalImage });
  }

  console.log('✅ [parseFCMForegroundMessage] 파싱 완료:', { content, deepLink, internalImage, type });
  return { content, deepLink, internalImage, type, raw: message };
};

export const parseFCMBackgroundMessage = (message: RemoteMessage) => {
  console.log('🔔 [parseFCMBackgroundMessage] FCM 백그라운드 메시지 파싱 시작');
  const display = message?.data?.display ?? message?.data?.data;
  const type = message?.data?.type ?? "";
  console.log('🏷️ [parseFCMBackgroundMessage] 메시지 타입:', type);

  let displayJson = null;
  if (display) {
    console.log('🎨 [parseFCMBackgroundMessage] Display 데이터 처리');
    if (typeof display === "string") {
      console.log('📝 [parseFCMBackgroundMessage] Display는 문자열, JSON 파싱 시작');
      displayJson = JSON.parse(display) as DisplayJSON;
    } else if (typeof display === "object") {
      console.log('📦 [parseFCMBackgroundMessage] Display는 객체, 직접 사용');
      displayJson = display as DisplayJSON;
    }

    if (type) {
      displayJson = {
        ...displayJson,
        type,
      };
      console.log('✅ [parseFCMBackgroundMessage] 타입 정보 추가 완료');
    }
  }

  const title = displayJson?.title;
  const displayMessage = displayJson?.body;
  const largeIconUrl = displayJson?.icon_path;
  const bigPictureUrl = displayJson?.icon_path;
  const displayType = displayJson?.type;
  console.log('✅ [parseFCMBackgroundMessage] 파싱 완료:', { title, displayMessage, largeIconUrl, displayType });

  return {
    title,
    message: displayMessage,
    largeIconUrl,
    bigPictureUrl,
    type: displayType,
    display: displayJson,
    raw: message,
  };
};

export const parseFCMBackgroundClickMessage = (message: RemoteMessage) => {
  console.log('👆 [parseFCMBackgroundClickMessage] FCM 백그라운드 클릭 메시지 파싱 시작');
  const display = message?.data?.display as string | undefined;
  const trigger = display ? JSON.parse(display) : {};
  console.log('🎨 [parseFCMBackgroundClickMessage] Display 데이터 파싱 완료');
  const deepLink = trigger?.action;
  const type = message?.data?.type;
  console.log('✅ [parseFCMBackgroundClickMessage] 파싱 완료:', { deepLink, type });
  return { deepLink, type, raw: message };
};

export const parseFCMQuitClickMessage = (message: RemoteMessage) => {
  console.log('🚪 [parseFCMQuitClickMessage] FCM 종료 상태 클릭 메시지 파싱 시작');
  const parsedDisplay = message?.data?.display as string | undefined;
  const trigger = parsedDisplay ? JSON.parse(parsedDisplay) : {};
  console.log('🎨 [parseFCMQuitClickMessage] Display 데이터 파싱 완료');
  const deepLink = trigger?.action;
  const type = message?.data?.type;
  console.log('✅ [parseFCMQuitClickMessage] 파싱 완료:', { deepLink, type });
  return { deepLink, type, raw: message };
};
