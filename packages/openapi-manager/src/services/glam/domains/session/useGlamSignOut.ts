import { glamAuthControllerSignOutMutationOptions } from "../../generated";
import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";

export const useGlamSignOut = () => {
  const { mutationFn } = glamAuthControllerSignOutMutationOptions();
  const { mutateAsync: signOutApi } = useMutation({ mutationFn });
  return useCallback(() => signOutApi({}), []);
};

// Alias for backward compatibility
export const useSignOutApi = useGlamSignOut;
