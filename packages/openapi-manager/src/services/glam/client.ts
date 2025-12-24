import { createOpenApiClientModule } from "@/core";
import { client } from "./generated/client.gen";

const notRequireRetryUrls = new Set([
  "/auth/v1/token",
  "/auth/v1/sign-out",
  "/auth/v1/sign-up",
  "/user/v1/cx-information",
]);

const notRequireAuthorizationUrls = new Set([
  "/auth/v1/phone-verification",
  "/auth/v1/sign-in",
  "/auth/v1/sign-up",
  "/auth/v1/token",
  "/auth/v1/intro",
]);

const requireUpdateErrorTypes = new Set([
  "unauthorized_token_error", // DB에 토큰 정보가 없을 경우, 올바르지 않은 토큰 실패할 수 있지만 호출
  "token_expired_error", // Legacy, 토큰이 만료되었을 경우
  "access_token_expired_error", // RTR 적용된 이후 Access Token 만료할 경우
]);

export const glamClient = createOpenApiClientModule<typeof client>({
  client,
  notRequireRetryUrls,
  notRequireAuthorizationUrls,
  requireUpdateErrorTypes,
});
