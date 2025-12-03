import {
  ComponentType,
  createContext,
  PropsWithChildren,
  ReactNode,
  Ref,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { BottomSheetModalRef } from "./BottomSheetController";

type BottomSheetContextType = {
  DefaultBottomSheet: ComponentType<{ ref?: Ref<BottomSheetModalRef> }>;
  mount(el: ReactNode): void;
  unmount(): void;
} | null;

interface PendingMount {
  element: ReactNode;
  resolve: () => void;
}

interface BottomSheetProviderProps extends PropsWithChildren {
  DefaultBottomSheet: ComponentType<{ ref?: Ref<BottomSheetModalRef> }>;
}

export const BottomSheetContext = createContext<BottomSheetContextType>(null);

export function BottomSheetProvider({
  children,
  DefaultBottomSheet,
}: BottomSheetProviderProps) {
  const [element, setElement] = useState<ReactNode | null>(null);

  const elementRef = useRef<ReactNode | null>(element);
  const pendingMountRef = useRef<PendingMount | null>(null);
  const pendingResolvedRef = useRef<boolean>(false);

  const syncSetElement = useCallback((el: ReactNode | null) => {
    elementRef.current = el;
    setElement(el);
  }, []);

  const mount = useCallback(
    (el: ReactNode) => {
      if (elementRef.current || pendingMountRef.current) {
        if (pendingMountRef.current) {
          pendingMountRef.current.resolve();
        }
        pendingResolvedRef.current = false;
        pendingMountRef.current = {
          element: el,
          resolve: () => {
            if (pendingResolvedRef.current) return;
            if (!elementRef.current) {
              syncSetElement(el);
              pendingMountRef.current = null;
              pendingResolvedRef.current = true;
            }
          },
        };
      } else {
        syncSetElement(el);
      }
    },
    [syncSetElement],
  );

  const unmount = useCallback(() => {
    syncSetElement(null);

    if (pendingMountRef.current) {
      const { resolve } = pendingMountRef.current;
      pendingMountRef.current = null;
      resolve();
    }
  }, [syncSetElement]);

  const context = useMemo(
    () => ({ mount, unmount, DefaultBottomSheet }),
    [mount, unmount, DefaultBottomSheet],
  );

  return (
    <BottomSheetContext.Provider value={context}>
      {children}
      {element}
    </BottomSheetContext.Provider>
  );
}
