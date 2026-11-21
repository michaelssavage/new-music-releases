import { getSession } from "@client/lib/spotify";
import { useAppStore } from "@client/store/appStore";
import { useQuery } from "@tanstack/react-query";

export const useSession = () => {
  const { userId } = useAppStore();

  return useQuery({
    queryKey: ["session", userId],
    queryFn: getSession,
    enabled: !!userId,
    refetchOnWindowFocus: false,
  });
};
