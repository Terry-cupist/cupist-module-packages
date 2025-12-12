import { IUserEventModule } from "@cupist/analytics-core";
import * as amplitude from "./amplitude";
import { getDeviceId } from "./utils/deviceId";

export interface IAmplitudeModuleProps {
  apiKey: string;
}

type instanceReturnType = IUserEventModule & {
  init: () => Promise<void>;
};

export const getAmplitudeInstance: ({
  apiKey,
}: IAmplitudeModuleProps &
  Partial<instanceReturnType>) => instanceReturnType = ({
  apiKey,
  ...props
}) => {
  return {
    init: async () => {
      if (apiKey) {
        const deviceId = await getDeviceId();
        amplitude.init(apiKey, undefined, {
          trackingOptions: {
            adid: true,
            idfv: true,
          },
        });
        if (deviceId) {
          amplitude.setDeviceId(deviceId);
        }
      }
    },
    log({ eventName, params }) {
      amplitude.logEvent(eventName, params);
    },
    logPurchase({ productId, price, params }) {
      const event = new amplitude.Revenue()
        .setProductId(productId)
        .setPrice(price)
        .setRevenue(price)
        .setQuantity(1)
        .setEventProperties(params);

      amplitude.revenue(event);
    },
    updateUserProperties({ userId, userProperties }) {
      const identifyObj = new amplitude.Identify();

      Object.entries(userProperties).forEach(([key, value]) => {
        identifyObj.set(key, value);
      });

      const prevUserId = amplitude.getUserId();
      if (userId && prevUserId !== userId) {
        amplitude.setUserId(userId);
      }

      amplitude.identify(identifyObj);
      amplitude.flush();
    },
    logout() {
      amplitude.reset();
    },
    ...props,
  };
};
