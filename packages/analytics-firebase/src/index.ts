import { IUserEventModule } from "@cupist/analytics-core";
import analytics from "@react-native-firebase/analytics";

export const getFirebaseInstance: () => IUserEventModule = () => {
  return {
    log({ eventName, params }) {
      analytics().logEvent(eventName, params);
    },
  };
};
