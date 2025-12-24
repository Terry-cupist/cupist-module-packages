import { glamAuthControllerSignOutMutationOptions } from "../../generated";
import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";

export const useGlamSignOut = () => {
  console.log("🚀 [useGlamSignOut:$3]");
  const { mutationFn } = glamAuthControllerSignOutMutationOptions();
  const { mutateAsync: signOutApi } = useMutation({ mutationFn });
  return useCallback(() => {
    console.log("👋 useGlamSignOut [callback:$3]");
    return signOutApi({});
  }, []);
};

// Alias for backward compatibility
export const useSignOutApi = useGlamSignOut;
