import { IUserEventModule } from "@cupist/analytics-core";
import { Platform } from "react-native";
import {
  Singular,
  SingularAndroidPurchase,
  SingularConfig,
  SingularIOSPurchase,
  SingularLinkParams,
} from "./singular";

export const getSingularInstance: (
  props: {
    apiKey: string;
    appSecret: string;
    onDeepLinkAction: (deeplink: string) => void;
  } & Partial<IUserEventModule>,
) => IUserEventModule = ({
  apiKey = "",
  appSecret = "",
  onDeepLinkAction,
  ...props
}) => ({
  async init() {
    Singular.init(
      new SingularConfig(apiKey, appSecret)
        .withSkAdNetworkEnabled(true)
        .withSessionTimeoutInSec(120)
        .withWaitForTrackingAuthorizationWithTimeoutInterval(300)
        .withSingularLink((singularLinkParams: SingularLinkParams) => {
          const { deeplink } = singularLinkParams;
          onDeepLinkAction(deeplink);
        }),
    );
  },

  log({ eventName, params = {} }) {
    Singular.eventWithArgs(eventName, params);
    Singular.limitDataSharing(false);
  },

  logPurchase({
    transactionId,
    orderId,
    productId,
    price,
    currency,
    receiptDetail,
    signature,
  }) {
    if (Platform.OS === "ios") {
      const singularPurchase = new SingularIOSPurchase(
        price,
        currency,
        productId,
        (transactionId ?? orderId) as string,
        receiptDetail,
      );
      Singular.inAppPurchase("__iap__", singularPurchase);
    } else if (Platform.OS === "android") {
      const singularPurchase = new SingularAndroidPurchase(
        price,
        currency,
        receiptDetail,
        signature ?? productId,
      );
      Singular.inAppPurchase("__iap__", singularPurchase);
    }
  },
  updateUserProperties({ userId, userProperties }) {
    if (userId) {
      Singular.setCustomUserId(userId);
    }

    Object.entries(userProperties).forEach(([key, value]) => {
      Singular.setGlobalProperty(key, String(value), true);
    });
  },

  logout(): void {
    Singular.clearGlobalProperties();
    Singular.unsetCustomUserId();
  },
  ...props,
});
