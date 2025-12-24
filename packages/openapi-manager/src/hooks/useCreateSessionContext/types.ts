import { PropsWithChildren } from "react";

export const enum UserState {
  /** 사진 등록전 */
  SIGN_UP_PROGRESSING = "sign_up_progressing",
  /** 사진 등록 후, 어드민 승인 전, 실제 앱 사용은 가능하나 유저간 인터랙션 결과 숨김 */
  REVIEW = "review",
  /** 어드민 사진 승인 후 */
  ACTIVE = "active",
  /** @deprecated 휴면 상태, 현재 사용되고 있지 않음 */
  DORMANT = "dormant",
  /** 이용정지(악성유저 등) */
  SUSPENDED = "suspended",
  /** 탈퇴 신청(대기중, n 일간 대기)   */
  DELETE_PENDING = "delete_pending",
  /** 탈퇴처리 */
  DELETED = "deleted",
  /** 악성유저 */
  MALICIOUS = "malicious",
}

export const enum ReviewState {
  LIVENESS_IMAGE_SERVER_REQUEST = "liveness_image_server_request",
  LIVENESS_IMAGE_REJECTED = "liveness_image_rejected",
  LIVENESS_IMAGE_REQUESTED = "liveness_image_requested",
  NOT_SET = "not_set",
}

export type Gender = "F" | "M";

export type ApiClientState = "idle" | "refreshing";

/**
 * | State                | Glam | ENFP | OnlyPass | Vrew | 비고                  |
   |----------------------|------|------|----------|------|---------------------|
   | accessToken          |  ✅   |  ✅   |    ✅     |  ✅   | 필수                  |
   | refreshToken         |  ✅   |  ✅   |    ✅     |  ⚠️  | Vrew는 저장만, state 없음 |
   | userState            |  ✅   |  ✅   |    ✅     |  ✅   | 필수                  |
   | reviewState          |  ✅   |  ✅   |    ✅     |  ✅   | 필수                  |
   | userStateMeta        |  ❌   |  ✅   |    ❌     |  ✅   | 메타 정보               |
   | initialized          |  ✅   |  ✅   |    ✅     |  ✅   | 필수                  |
   | hasSigninUserSession |  ❌   |  ✅   |    ❌     |  ✅   | computed            |
   | isActive             |  ✅   |  ❌   |    ✅     |  ❌   | computed            |
   | isOnboarding         |  ✅   |  ❌   |    ✅     |  ❌   | 온보딩 플래그             |
   | userId               |  ❌   |  ✅   |    ❌     |  ❌   | ENFP 전용             |
   | profileId            |  ❌   |  ✅   |    ❌     |  ❌   | ENFP 전용             |
   | gender               |  ❌   |  ✅   |    ❌     |  ❌   | ENFP 전용             |
   | age                  |  ❌   |  ✅   |    ❌     |  ❌   | ENFP 전용             |
   | isWaitingForApproval |  ❌   |  ✅   |    ❌     |  ❌   | ENFP 전용             |
   | isDeletingAccount    |  ❌   |  ❌   |    ✅     |  ❌   | OnlyPass 전용         |
   | state                |  ❌   |  ✅   |    ❌     |  ❌   | ENFP 전용 (API 상태)    |
   | initData             |  ❌   |  ✅   |    ❌     |  ❌   | ENFP 전용             |
 */
export interface SessionState {
  // 🔐 인증 토큰
  accessToken: string;
  refreshToken: string; // Vrew는 state 없음 (저장만)

  // 👤 사용자 상태
  userState: `${string & UserState}`;
  reviewState: `${string & ReviewState}`;
  userStateMeta?: string; // ENFP, Vrew

  // 🚀 초기화 상태
  initialized: boolean;

  // ✅ 활성 세션 체크
  hasSigninUserSession?: boolean; // ENFP, Vrew
  isActive?: boolean; // Glam, OnlyPass

  // 📱 온보딩
  isOnboarding?: boolean; // Glam, OnlyPass

  // 👥 사용자 상세 정보
  userId?: number; // ENFP
  profileId?: number; // ENFP
  gender?: `${string & Gender}`; // ENFP
  age?: number; // ENFP

  // 🔄 특수 상태
  isWaitingForApproval?: boolean; // ENFP (회원가입 승인 대기)
  isDeletingAccount?: boolean; // OnlyPass (계정 삭제 진행)

  // 📊 API 상태
  state?: `${string & ApiClientState}`; // ENFP ('idle' | 'loading' | ...)

  // 📦 추가 데이터
  initData?: any; // ENFP (초기 데이터 객체)
}

export type RevokeParams<T extends Partial<SessionState> = SessionState> = {
  session?: T;
  intended?: boolean;
};

export type SessionProviderProps<
  T extends Partial<SessionState> = SessionState,
> = PropsWithChildren<{
  initialState: T;
  accessTokenStoreKey?: string;
  refreshTokenStoreKey?: string;
  onSignOutApi: () => Promise<any>;
  onClearApiCache?: () => void;
  onRemoveStoredValues?: () => Promise<void>;
  onNavigateAfterRevokeSession?: (params: RevokeParams<T>) => void;
  onRevokeChat: (params: RevokeParams<T>) => Promise<any>;
  onRevokeUserEvent: (params: RevokeParams<T>) => Promise<any>;
  onRevokeNotification: (params: RevokeParams<T>) => Promise<any>;
  onGetAccessRefreshToken: () => Promise<{
    accessToken: string;
    refreshToken: string;
  }>;
  onSetSessionLocalStorage: (params: Partial<T>) => Promise<void>;
  onInitSessionError: (error: Error) => void;
  onGetExtraSessionLocalStorageState: () => Promise<Partial<T>>;
  onRequestRefreshTokenApi: (refreshToken: string) => Promise<{
    accessToken: string;
    refreshToken: string;
  }>;
  onAfterRefreshToken?: () => void | Promise<void>;
  onRequestRefreshTokenError: (error: Error) => void;
  onRequestRefreshTokenUI: () => void;
}>;

export type UseCreateSessionContextResult<
  T extends Partial<SessionState> = SessionState,
> = T & {
  storeSession: (partialSession: Partial<T>) => Promise<void>;
  revokeSession: (params: RevokeParams<T>) => Promise<void>;
  requestRefreshToken: (
    onRefreshResultCallback?: (isSuccess: boolean) => void | Promise<void>,
  ) => Promise<void>;
};
