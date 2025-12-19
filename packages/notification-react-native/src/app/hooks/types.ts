import { NotificationManageContextValue } from "@cupist/notification-core";
import { DependencyList } from "react";

export interface UseRNHookBaseProps<T extends (...args: any) => any>
  extends Partial<NotificationManageContextValue> {
  onClickResponse?: (params: ReturnType<T>) => void;
  getValidNotificationData?: (params: ReturnType<T>) => ReturnType<T>;
  dependencies?: DependencyList;
}
