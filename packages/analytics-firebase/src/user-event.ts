import { IUserEventModule } from "@cupist/analytics-core";
import analytics from "./firebase";

export function convertFirebaseUserProperties(
  userProperties: Record<string, any>,
) {
  return Object.keys(userProperties).reduce(
    (r, key) => {
      if (userProperties[key]) {
        r[key] = userProperties[key]?.toString();
      }
      return r;
    },
    {} as { [key: string]: string | null },
  );
}

export const getFirebaseInstance: () => IUserEventModule = () => {
  return {
    log({ eventName, params }) {
      analytics().logEvent(eventName, params);
    },
    conversion({ code }) {
      analytics().logEvent(code);
    },
    updateUserProperties({ userId, userProperties }) {
      analytics().setUserId(userId);
      analytics().setUserProperties(
        convertFirebaseUserProperties(userProperties),
      );
    },
    putUserProperties({ userProperties }) {
      analytics().setUserProperties(
        convertFirebaseUserProperties(userProperties),
      );
    },
    logout() {
      analytics().setUserId(null);
    },
  };
};
