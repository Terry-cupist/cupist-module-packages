import { IUserEventModule } from "@cupist/analytics-core";
import { AppEventsLogger, Settings } from "./facebook";

type instanceReturnType = IUserEventModule & {
  init: () => void;
};

export const getFacebookInstance: (
  props: Partial<instanceReturnType>,
) => instanceReturnType = (props) => {
  return {
    init: () => Settings.initializeSDK(),
    conversion: ({ code }) => {
      AppEventsLogger.logEvent(code);
    },
    ...props,
  };
};
