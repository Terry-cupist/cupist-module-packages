import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";
import { glamAuthControllerSignOutMutationOptions } from "../../generated";

export const useGlamSignOut = () => {
  console.log("🚀 [useGlamSignOut]");
  const { mutationFn } = glamAuthControllerSignOutMutationOptions();
  const { mutateAsync: signOutApi } = useMutation({ mutationFn });
  return useCallback(() => {
    console.log("👋 useGlamSignOut [callback]");
    return signOutApi({});
  }, []);
};

// Alias for backward compatibility
export const useSignOutApi = useGlamSignOut;
