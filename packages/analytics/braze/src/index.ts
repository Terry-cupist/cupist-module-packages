import Braze from "@braze/react-native-sdk";
import { IUserEventModule } from "@cupist/analytics-core";

export const getBrazeInstance: () => IUserEventModule = () => {
  return {
    log({ eventName, params }) {
      Braze.logCustomEvent(eventName, params);
    },
    logPurchase({ productId, price, currency, params }) {
      Braze.logPurchase(productId, price.toString(), currency, 1, params);
    },
    updateUserProperties({ userId, userProperties }) {
      Braze.changeUser(userId as string);

      if (userId) {
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
      }
    },
    putUserProperties({ userProperties }) {
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
