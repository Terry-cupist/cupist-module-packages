import { IUserEventModule } from "@cupist/analytics-core";
import analytics from "@react-native-firebase/analytics";

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
      analytics().setUserProperties(userProperties);
    },
    putUserProperties({ userProperties }) {
      analytics().setUserProperties(userProperties);
    },
    logout() {
      analytics().setUserId(null);
    },
  };
};
