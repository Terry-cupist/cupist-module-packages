import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type NotificationUIData = {
  content: string;
  deepLink?: string;
  image?: string;
  type?: string;
};

export type NotificationManageContextValue = {
  token: string;
  // Notification User Interaction Effects
  onLogNotificationEvent: (type: string) => void;
  onRefreshBadgeCount: () => void;

  // Notification Foreground UI
  shouldShowNotification?: (params: NotificationUIData) => boolean;
  onBeforeShowNotification?: (params: NotificationUIData) => void;
  onRenderNotification: (
    params: NotificationUIData & { onPress?: () => void },
  ) => void;
  onNotificationPress?: (params: NotificationUIData) => void;
  onAfterShowNotification?: (params: NotificationUIData) => void;

  // Deep Link Action
  onRefreshQueriesForDeepLink: (deepLink: string) => void | Promise<void>;
  onNavigateToDeepLink: (deepLink: string) => void;
  onOpenExternalLink: (deepLink: string) => void;

  // Navigation Active Trigger
  activeNotificationNavigation: () => void;

  // Local Push Notification
  onDisplayLocalNotification: (
    notificationInfo: { title: string; message: string; largeIconUrl: string },
    userInfo: unknown,
  ) => void;
};
export const NotificationManageContext =
  createContext<NotificationManageContextValue>({
    token: "",
    // Notification User Interaction Effects
    onLogNotificationEvent: () => {},
    onRefreshBadgeCount: () => {},

    // Notification Foreground UI
    shouldShowNotification: () => true,
    onBeforeShowNotification: () => {},
    onRenderNotification: () => {},
    onNotificationPress: () => {},
    onAfterShowNotification: () => {},

    // Deep Link Action
    onRefreshQueriesForDeepLink: () => {},
    onNavigateToDeepLink: () => {},
    onOpenExternalLink: () => {},

    // Navigation Active Trigger
    activeNotificationNavigation: () => {},

    // Local Push Notification
    onDisplayLocalNotification: () => {},
  });

type NotificationManageProviderProps = PropsWithChildren<{
  notificationAvailableKey?: string;
  // Environment management
  onSetupForegroundBehavior: () => void;
  onCreateNotificationChannel: () => void;

  // Token management
  onRequestNotificationPermission: () => Promise<void>;
  onEnsureDeviceRegistration: () => Promise<void>;
  onFetchNotificationToken: () => Promise<string> | string;
  onRegisterTokenToServer?: (token: string) => Promise<any>;
  onSubscribeToTokenRefresh: (
    callback: (newToken: string) => void,
  ) => () => void;
  onLoadStoredToken: () => Promise<string>;
  onSaveToken: (token: string) => Promise<void> | void;
  onTokenInitializationError?: (error: unknown) => void;
  onTokenChangeError?: (error: unknown) => void;

  // Notification User Interaction Effects
  onLogNotificationEvent: (type: string) => void;
  onRefreshBadgeCount: () => void;

  // Deep Link Action
  onRefreshQueriesForDeepLink: (deepLink: string) => void | Promise<void>;
  onNavigateToDeepLink: (deepLink: string) => void;
  onOpenExternalLink: (deepLink: string) => void;

  // Notification Foreground UI
  shouldShowNotification?: (params: NotificationUIData) => boolean;
  onBeforeShowNotification?: (params: NotificationUIData) => void;
  onRenderNotification: (
    params: NotificationUIData & { onPress?: () => void },
  ) => void;
  onNotificationPress?: (params: NotificationUIData) => void;
  onAfterShowNotification?: (params: NotificationUIData) => void;

  // Local Push Notification
  onDisplayLocalNotification: (
    notificationInfo: { title: string; message: string; largeIconUrl: string },
    userInfo: unknown,
  ) => void;
}>;

export const NotificationManageProvider = ({
  notificationAvailableKey,
  children,
  // Environment management
  onSetupForegroundBehavior,
  onCreateNotificationChannel,

  // Token management
  onRequestNotificationPermission,
  onEnsureDeviceRegistration,
  onFetchNotificationToken,
  onRegisterTokenToServer,
  onSubscribeToTokenRefresh,
  onLoadStoredToken,
  onSaveToken,
  onTokenInitializationError,
  onTokenChangeError,

  // Notification User Interaction Effects
  onLogNotificationEvent,
  onRefreshBadgeCount,

  // Notification Foreground UI
  shouldShowNotification,
  onBeforeShowNotification,
  onRenderNotification,
  onNotificationPress,
  onAfterShowNotification,

  // Deep Link Action
  onRefreshQueriesForDeepLink,
  onNavigateToDeepLink: _onNavigateToDeepLink,
  onOpenExternalLink,

  // Local Push Notification
  onDisplayLocalNotification,
}: NotificationManageProviderProps) => {
  const [token, setToken] = useState("");

  useEffect(() => {
    console.log("🚀 [NotificationManageProvider] 초기화 시작");
    onSetupForegroundBehavior();
    console.log(
      "✅ [NotificationManageProvider] Foreground behavior 설정 완료",
    );
    onCreateNotificationChannel();
    console.log(
      "✅ [NotificationManageProvider] Notification channel 생성 완료",
    );
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (notificationAvailableKey) {
          console.log(
            "🔑 [NotificationManageProvider] 토큰 초기화 가능 notificationAvailableKey",
            notificationAvailableKey,
          );
          console.log("🔑 [NotificationManageProvider] 토큰 초기화 시작");
          await onRequestNotificationPermission();
          console.log("✅ [NotificationManageProvider] 알림 권한 요청 완료");
          await onEnsureDeviceRegistration();
          console.log("✅ [NotificationManageProvider] 디바이스 등록 완료");

          const responseToken = await onFetchNotificationToken();
          console.log(
            "📱 [NotificationManageProvider] 토큰 가져오기 완료:",
            responseToken,
          );
          setToken(responseToken);
          await onRegisterTokenToServer?.(responseToken);
          console.log("📤 [NotificationManageProvider] 서버에 토큰 등록 완료");
          onSaveToken(responseToken);
          console.log("💾 [NotificationManageProvider] 토큰 저장 완료");
        } else {
          console.log(
            "⚠️ [NotificationManageProvider] 토큰 빈 문자열 초기화 notificationAvailableKey 없음",
          );
          setToken("");
        }
      } catch (error) {
        console.error(
          "❌ [NotificationManageProvider] 토큰 초기화 실패:",
          error,
        );
        onTokenInitializationError?.(error);
      }
    })();
  }, [notificationAvailableKey]);

  useEffect(() => {
    (async () => {
      if (token && notificationAvailableKey) {
        console.log(
          "🔑 [NotificationManageProvider] 토큰 리프레시 체크 가능 notificationAvailableKey",
          notificationAvailableKey,
        );
        try {
          console.log("🔄 [NotificationManageProvider] 토큰 변경 감지:", token);
          const prevToken = await onLoadStoredToken();
          console.log(
            "📥 [NotificationManageProvider] 이전 토큰 로드:",
            prevToken,
          );
          if (prevToken !== token) {
            console.log(
              "🆕 [NotificationManageProvider] 토큰 변경됨, 서버에 등록 시작",
            );
            await onRegisterTokenToServer?.(token);
            console.log(
              "📤 [NotificationManageProvider] 서버에 새 토큰 등록 완료",
            );
            onSaveToken(token);
            console.log("💾 [NotificationManageProvider] 새 토큰 저장 완료");
          } else {
            console.log("✓ [NotificationManageProvider] 토큰 변경 없음");
          }
        } catch (error) {
          console.error(
            "❌ [NotificationManageProvider] 토큰 변경 처리 실패:",
            error,
          );
          onTokenChangeError?.(error);
        }
      }
    })();
  }, [token, notificationAvailableKey]);

  useEffect(() => {
    console.log("🔔 [NotificationManageProvider] 토큰 갱신 구독 시작");
    return onSubscribeToTokenRefresh((newToken) => {
      console.log("🆕 [NotificationManageProvider] 토큰 갱신됨:", newToken);
      setToken(newToken);
    });
  }, []);

  const [isNotificationNavigationActive, setIsNotificationNavigationActive] =
    useState(false);
  const isNotificationNavigationActiveRef = useRef(false);
  const activeNotificationNavigation = useCallback(() => {
    console.log("🧭 [NotificationManageProvider] 알림 네비게이션 활성화");
    setIsNotificationNavigationActive(true);
    isNotificationNavigationActiveRef.current = true;
  }, []);

  const navigationDeepLink = useRef<string>("");
  const onNavigateToDeepLink = useCallback(
    (deepLink: string) => {
      console.log(
        "🔗 [NotificationManageProvider] 딥링크 네비게이션 요청:",
        deepLink,
      );
      if (
        isNotificationNavigationActiveRef.current &&
        !navigationDeepLink.current
      ) {
        console.log("➡️ [NotificationManageProvider] 즉시 네비게이션 실행");
        _onNavigateToDeepLink(deepLink);
      } else {
        console.log("⏸️ [NotificationManageProvider] 딥링크 대기 상태로 저장");
        navigationDeepLink.current = deepLink;
      }
    },
    [isNotificationNavigationActive, _onNavigateToDeepLink],
  );

  useEffect(() => {
    if (isNotificationNavigationActive && navigationDeepLink.current) {
      console.log(
        "🚀 [NotificationManageProvider] 대기 중인 딥링크 실행:",
        navigationDeepLink.current,
      );
      _onNavigateToDeepLink(navigationDeepLink.current);
      navigationDeepLink.current = "";
      console.log(
        "✅ [NotificationManageProvider] 딥링크 실행 완료, 대기 상태 초기화",
      );
    }
  }, [isNotificationNavigationActive, _onNavigateToDeepLink]);

  const contextValue: NotificationManageContextValue = useMemo(
    () => ({
      token,

      // Notification User Interaction Effects
      onLogNotificationEvent,
      onRefreshBadgeCount,

      // Deep Link Action
      onRefreshQueriesForDeepLink,
      onNavigateToDeepLink,
      onOpenExternalLink,

      // Notification Foreground UI
      shouldShowNotification,
      onBeforeShowNotification,
      onRenderNotification,
      onNotificationPress,
      onAfterShowNotification,

      // Navigation Active Trigger
      activeNotificationNavigation,

      // Local Push Notification
      onDisplayLocalNotification,
    }),
    [
      token,

      // Notification User Interaction Effects
      onLogNotificationEvent,
      onRefreshBadgeCount,

      // Deep Link Action
      onRefreshQueriesForDeepLink,
      onNavigateToDeepLink,
      onOpenExternalLink,

      // Notification Foreground UI
      shouldShowNotification,
      onBeforeShowNotification,
      onRenderNotification,
      onNotificationPress,
      onAfterShowNotification,

      // Navigation Active Trigger
      activeNotificationNavigation,

      // Local Push Notification
      onDisplayLocalNotification,
    ],
  );
  return (
    <NotificationManageContext.Provider value={contextValue}>
      {children}
    </NotificationManageContext.Provider>
  );
};

export const useNotificationManage = (
  overrideTargetProps: Partial<NotificationManageContextValue> = {},
) => {
  const context = useContext(NotificationManageContext);
  if (!context) {
    throw new Error(
      "useNotificationManage must be used within a NotificationManageProvider",
    );
  }

  return {
    ...context,
    ...overrideTargetProps,
  };
};
