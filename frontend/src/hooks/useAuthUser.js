import { useQuery } from "@tanstack/react-query";
import { getAuthUser } from "../lib/api";

function useAuthUser() {
  const authUser = useQuery({
    queryKey: ["authUser"],
    queryFn: getAuthUser,
    enabled: true,   
    retry: false,
  });

  return {
    isLoading: authUser.isLoading,
    authUser: authUser.data?.user,
  };
}

export default useAuthUser;
