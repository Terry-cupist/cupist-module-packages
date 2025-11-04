import * as amplitude from "@amplitude/analytics-react-native";
import { IUserEventModule } from "@cupist/analytics-core";
import { getDeviceId } from "./utils/deviceId";

export interface IAmplitudeModuleProps {
  apiKey: string;
}

export const getAmplitudeInstance: ({
  apiKey,
}: IAmplitudeModuleProps) => IUserEventModule & {
  init: () => Promise<void>;
} = ({ apiKey }) => {
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
      amplitude.setUserId(userId as string);
      amplitude.identify(identifyObj);
      amplitude.flush();
    },
    putUserProperties({ userProperties }) {
      const identifyObj = new amplitude.Identify();

      Object.entries(userProperties).forEach(([key, value]) => {
        identifyObj.set(key, value);
      });
      amplitude.identify(identifyObj);
      amplitude.flush();
    },
    logout() {
      amplitude.reset();
    },
  };
};
