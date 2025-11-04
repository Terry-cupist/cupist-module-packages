import { IUserEventModule } from "@cupist/analytics-core";
import { getAnalytics, logEvent } from "@react-native-firebase/analytics";

export const analytics = getAnalytics();

export const getFirebaseInstance: () => IUserEventModule = () => {
  return {
    log({ eventName, params }) {
      logEvent(analytics, eventName, params);
    },
  };
};
