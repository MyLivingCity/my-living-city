import { useQuery } from "react-query";
import { getUserWithJWT, type UseUserWithJwtInput } from "@lib/api/user.routes";
import { AxiosError } from "axios";
import { type IUser } from "@lib/types/user/user.types";

export const useUserWithJwt = ({
  jwtAuthToken,
  shouldTrigger,
}: UseUserWithJwtInput) => {
  return useQuery<IUser, AxiosError>(
    "user",
    () => getUserWithJWT({ jwtAuthToken }),
    {
      enabled: shouldTrigger,
      staleTime: 1000 * 60 * 10,
    },
  );
};
