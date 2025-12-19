import { NotificationManageContextValue } from "@cupist/notification-core";
import { FirebaseMessagingTypes } from "@react-native-firebase/messaging";
import { DependencyList } from "react";

export interface UseFCMHookBaseProps<T extends (...args: any) => any>
  extends Partial<NotificationManageContextValue> {
  onMessage?: (params: ReturnType<T>) => void;
  getValidNotificationData?: (params: ReturnType<T>) => ReturnType<T>;
  dependencies?: DependencyList;
  messaging?: FirebaseMessagingTypes.Module;
}
