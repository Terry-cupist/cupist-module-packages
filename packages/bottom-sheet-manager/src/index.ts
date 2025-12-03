/**
 * @cupist/bottom-sheet-manager
 *
 * Framework-agnostic bottom sheet manager that accepts external UI components.
 * This package manages bottom sheet state and lifecycle without depending on specific UI libraries.
 */

export { BottomSheetProvider, BottomSheetContext } from "./BottomSheetProvider";
export { useBottomSheet } from "./useBottomSheet";
export {
  BottomSheetController,
  type BottomSheetModalRef,
  type BottomSheetModalProps,
  type BottomSheetControlRef,
} from "./BottomSheetController";
