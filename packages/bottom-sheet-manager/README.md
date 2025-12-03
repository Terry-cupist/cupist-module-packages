# @cupist/bottom-sheet-manager

Framework-agnostic bottom sheet manager that accepts external UI components. This package manages bottom sheet state and lifecycle without depending on specific UI libraries like `@gorhom/bottom-sheet`.

## Features

- 🎨 **UI Framework Agnostic**: Bring your own bottom sheet UI component
- 🔌 **Flexible Integration**: Works with any bottom sheet library that follows the interface
- 📦 **Zero UI Dependencies**: No hardcoded dependency on specific UI libraries
- 🎯 **Type-Safe**: Full TypeScript support with generic types
- 🪝 **Simple Hook API**: Easy-to-use React hook interface

## Installation

```bash
npm install @cupist/bottom-sheet-manager
# or
pnpm add @cupist/bottom-sheet-manager
# or
yarn add @cupist/bottom-sheet-manager
```

## Requirements

Your bottom sheet UI component must satisfy the following interface:

```typescript
// Component must accept a ref with these methods
interface BottomSheetModalRef {
  open: () => void;
  close: () => void;
}

// Component must accept onDismiss prop
interface BottomSheetModalProps {
  onDismiss: () => void;
  // ... other props
}
```

## Usage

### 1. Setup Provider

Wrap your app with `BottomSheetProvider`:

```tsx
import { BottomSheetProvider } from "@cupist/bottom-sheet-manager";

function App() {
  return (
    <BottomSheetProvider>
      <YourApp />
    </BottomSheetProvider>
  );
}
```

### 2. Create a Bottom Sheet Component

Here's an example using `@gorhom/bottom-sheet`:

```tsx
import BottomSheet, { BottomSheetModal } from "@gorhom/bottom-sheet";
import { forwardRef, useImperativeHandle, useRef } from "react";
import type { BottomSheetModalRef } from "@cupist/bottom-sheet-manager";

interface MyBottomSheetProps {
  onDismiss: () => void;
  snapPoints?: string[];
  // ... other custom props
}

export const MyBottomSheet = forwardRef<
  BottomSheetModalRef,
  MyBottomSheetProps
>(({ children, onDismiss, snapPoints = ["50%", "90%"], ...props }, ref) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  useImperativeHandle(ref, () => ({
    open: () => bottomSheetRef.current?.present(),
    close: () => bottomSheetRef.current?.dismiss(),
  }));

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      onDismiss={onDismiss}
      {...props}
    >
      {children}
    </BottomSheetModal>
  );
});
```

### 3. Use the Hook

```tsx
import { useBottomSheet } from "@cupist/bottom-sheet-manager";
import { MyBottomSheet } from "./MyBottomSheet";

function MyComponent() {
  const { open, close } = useBottomSheet();

  const handleOpenBottomSheet = () => {
    open(
      MyBottomSheet,
      <View>
        <Text>Bottom Sheet Content</Text>
      </View>,
      {
        modalProps: {
          snapPoints: ["25%", "50%", "90%"],
          // ... other props for MyBottomSheet
        },
      }
    );
  };

  return (
    <Button onPress={handleOpenBottomSheet}>
      Open Bottom Sheet
    </Button>
  );
}
```

## API Reference

### `BottomSheetProvider`

Provider component that manages bottom sheet state.

```tsx
<BottomSheetProvider>{children}</BottomSheetProvider>
```

### `useBottomSheet<P>()`

Hook for controlling bottom sheets.

#### Returns

```typescript
{
  open: (
    ModalComponent: ComponentType<P & { ref?: Ref<BottomSheetModalRef> }>,
    component: JSX.Element,
    options?: { modalProps?: Omit<P, "onDismiss"> }
  ) => void;
  close: () => void;
}
```

#### Parameters

- `ModalComponent`: Your bottom sheet UI component (must have `open`, `close` ref methods and `onDismiss` prop)
- `component`: Content to display inside the bottom sheet
- `options.modalProps`: Additional props to pass to your `ModalComponent`

### Type Definitions

```typescript
// Required ref interface for your bottom sheet component
interface BottomSheetModalRef {
  open: () => void;
  close: () => void;
}

// Required props interface for your bottom sheet component
interface BottomSheetModalProps {
  onDismiss: () => void;
  [key: string]: any;
}
```

## Examples

### With Custom Props

```tsx
interface CustomBottomSheetProps {
  onDismiss: () => void;
  backgroundColor?: string;
  enablePanDownToClose?: boolean;
}

const CustomBottomSheet = forwardRef<
  BottomSheetModalRef,
  CustomBottomSheetProps
>(({ children, onDismiss, backgroundColor, enablePanDownToClose }, ref) => {
  // ... implementation
});

// Usage
const { open } = useBottomSheet<CustomBottomSheetProps>();

open(
  CustomBottomSheet,
  <MyContent />,
  {
    modalProps: {
      backgroundColor: "#fff",
      enablePanDownToClose: true,
    },
  }
);
```

### With Different UI Libraries

The manager works with any bottom sheet library. Here's a conceptual example with a different library:

```tsx
import { SomeOtherBottomSheet } from "some-other-library";
import { forwardRef, useImperativeHandle } from "react";

const MyCustomSheet = forwardRef((props, ref) => {
  const sheetRef = useRef();

  useImperativeHandle(ref, () => ({
    open: () => sheetRef.current?.show(),
    close: () => sheetRef.current?.hide(),
  }));

  return <SomeOtherBottomSheet ref={sheetRef} {...props} />;
});
```

## Migration from v1.x

If you were using v1.x with built-in `@gorhom/bottom-sheet` dependency:

**Before (v1.x):**
```tsx
const { open } = useBottomSheet();
open(<Content />, { modalProps: {...} });
```

**After (v2.x):**
```tsx
const { open } = useBottomSheet();
open(MyBottomSheetComponent, <Content />, { modalProps: {...} });
```

Key changes:
1. You must provide your own bottom sheet UI component
2. First parameter is now the component, second is the content
3. Remove `@gorhom/bottom-sheet` from dependencies (if you still use it, keep it)
4. Create a wrapper component that satisfies the `BottomSheetModalRef` interface

## License

ISC

## Author

cupist-terry
