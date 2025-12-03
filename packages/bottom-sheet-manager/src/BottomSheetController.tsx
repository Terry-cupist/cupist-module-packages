import {
  forwardRef,
  PropsWithChildren,
  Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  ComponentType,
} from "react";

/**
 * Bottom sheet 컴포넌트가 가져야 하는 ref 메서드 인터페이스
 */
export interface BottomSheetModalRef {
  open: () => void;
  close: () => void;
}

/**
 * Bottom sheet 컴포넌트가 받아야 하는 props 인터페이스
 */
export interface BottomSheetModalProps {
  onDismiss: () => void;
  [key: string]: any;
}

/**
 * BottomSheetController가 외부에 노출하는 ref 인터페이스
 */
export interface BottomSheetControlRef {
  close: () => void;
}

interface Props<P extends BottomSheetModalProps = BottomSheetModalProps> {
  /**
   * Bottom sheet UI 컴포넌트
   * - open, close 메서드를 가진 ref 필수
   * - onDismiss prop 필수
   */
  ModalComponent: ComponentType<P & { ref?: Ref<BottomSheetModalRef> }>;
  /**
   * ModalComponent에 전달할 추가 props
   */
  modalProps?: Omit<P, "onDismiss">;
  /**
   * Bottom sheet가 닫힐 때 호출되는 콜백
   */
  onDismiss: () => void;
}

export const BottomSheetController = forwardRef(
  <P extends BottomSheetModalProps = BottomSheetModalProps>(
    {
      children,
      ModalComponent,
      modalProps,
      onDismiss,
    }: PropsWithChildren<Props<P>>,
    ref: Ref<BottomSheetControlRef>,
  ) => {
    const bottomSheetRef = useRef<BottomSheetModalRef>(null);
    const [isOpenBottomSheet, setIsOpenBottomSheet] = useState(false);

    const handleBottomSheetClose = useCallback(
      () => setIsOpenBottomSheet(false),
      [],
    );

    useImperativeHandle(ref, () => ({ close: handleBottomSheetClose }), [
      handleBottomSheetClose,
    ]);

    useEffect(() => {
      requestAnimationFrame(() => setIsOpenBottomSheet(true));
    }, []);

    useEffect(() => {
      if (isOpenBottomSheet) {
        bottomSheetRef.current?.open?.();
      } else {
        bottomSheetRef.current?.close?.();
      }
    }, [isOpenBottomSheet]);

    return (
      <ModalComponent
        ref={bottomSheetRef}
        {...(modalProps as P)}
        onDismiss={onDismiss}
      >
        {children}
      </ModalComponent>
    );
  },
) as <P extends BottomSheetModalProps = BottomSheetModalProps>(
  props: PropsWithChildren<Props<P>> & { ref?: Ref<BottomSheetControlRef> },
) => JSX.Element;
