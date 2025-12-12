import { IUserEventModule } from "@cupist/analytics-core";
import {
  getAnalytics,
  logEvent,
  setUserId,
  setUserProperties,
} from "./firebase";

export const analytics = getAnalytics();

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

export const getFirebaseInstance: (
  props: Partial<IUserEventModule>,
) => IUserEventModule = (props) => {
  return {
    log({ eventName, params }) {
      logEvent(analytics, eventName, params);
    },
    conversion({ code }) {
      logEvent(analytics, code);
    },
    updateUserProperties({ userId, userProperties }) {
      if (userId) {
        setUserId(analytics, userId);
      }

      setUserProperties(
        analytics,
        convertFirebaseUserProperties(userProperties),
      );
    },
    logout() {
      setUserId(analytics, null);
    },
    ...props,
  };
};
