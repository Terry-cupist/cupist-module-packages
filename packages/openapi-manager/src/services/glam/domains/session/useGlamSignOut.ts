import { glamAuthControllerSignOutMutationOptions } from "../../generated";
import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";

export const useGlamSignOut = () => {
  console.log("🚀 useGlamSignOut: Glam 로그아웃 훅을 초기화합니다.");
  const { mutationFn } = glamAuthControllerSignOutMutationOptions();
  const { mutateAsync: signOutApi } = useMutation({ mutationFn });
  return useCallback(() => {
    console.log("👋 useGlamSignOut callback: 로그아웃 API를 호출합니다.");
    return signOutApi({});
  }, []);
};

// Alias for backward compatibility
export const useSignOutApi = useGlamSignOut;
