import { NotificationManageContextValue } from "@cupist/notification-core";
import { DependencyList } from "react";

export type UseExpoHookCallbackType<T extends (...args: any) => any> = (
  params: ReturnType<T>,
) => void;

export interface UseFCMHookBaseProps<T extends (...args: any) => any>
  extends Partial<NotificationManageContextValue> {
  getValidNotificationData?: (notification: ReturnType<T>) => ReturnType<T>;
  dependencies?: DependencyList;
}
