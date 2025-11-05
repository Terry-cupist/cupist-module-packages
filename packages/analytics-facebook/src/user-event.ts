import { IUserEventModule } from "@cupist/analytics-core";
import { AppEventsLogger, Settings } from "./facebook";

export const getFacebookInstance: () => IUserEventModule & {
  init: () => void;
} = () => {
  return {
    init: () => Settings.initializeSDK(),
    conversion: ({ code }) => {
      AppEventsLogger.logEvent(code);
    },
  };
};
