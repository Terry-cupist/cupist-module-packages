import { IUserEventModule } from "@cupist/analytics-core";
import Braze, { getBrazeUserId } from "./braze";

export const getBrazeInstance: () => IUserEventModule = () => {
  return {
    log({ eventName, params }) {
      Braze.logCustomEvent(eventName, params);
    },
    logPurchase({ productId, price, currency, params }) {
      Braze.logPurchase(productId, price.toString(), currency, 1, params);
    },
    async updateUserProperties({ userId, userProperties }) {
      const prevUserId = await getBrazeUserId();
      if (userId && prevUserId !== userId) {
        Braze.changeUser(userId as string);
      }

      Object.entries(userProperties).forEach(([key, value]) => {
        if (key === "nickname") {
          Braze.setFirstName(value);
        } else if (key === "gender" && ["F", "M"].includes(value)) {
          Braze.setGender(value.toLowerCase());
        } else {
          // NOTE: value가 null인 경우 해당 프로퍼티를 지우는 동작이 실행되며, 이로 인해 회원가입 시 crash가 발생할 수 있다.
          const convertedValue = value === null ? undefined : value;
          Braze.setCustomUserAttribute(key, convertedValue);
        }
      });
    },
    logout() {
      Braze.changeUser("");
    },
  };
};
