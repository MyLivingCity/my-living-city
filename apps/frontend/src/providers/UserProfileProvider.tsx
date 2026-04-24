import React, { useState, useMemo } from "react";
import { UserProfileContext } from "@/contexts/UserProfileContext";
import { useUserWithJwt } from "src/hooks/userHooks";
import { type IUser } from "src/lib/types/user/user.types";
import { type IFetchError } from "src/lib/types/general/error.types";
import { retrieveStoredTokenExpiryInLocalStorage } from "src/lib/utils";

const getUserFromLocalStorage = (): IUser | null => {
  const stringifiedUser = localStorage.getItem("logged-user");
  if (!stringifiedUser) return null;
  return JSON.parse(stringifiedUser) as IUser;
};

const UserProfileProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );
  const [user, setUser] = useState<IUser | null>(getUserFromLocalStorage());
  const [fetchError, setFetchError] = useState<IFetchError | null>(null);

  const isTokenValid = (): boolean => {
    const tokenExpiry = retrieveStoredTokenExpiryInLocalStorage();
    if (!tokenExpiry) return false;
    return new Date() <= tokenExpiry;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setFetchError(null);
    localStorage.clear();
  };

  const isUserAuthenticated = (): boolean => {
    return !!user && !!token;
  };

  const shouldTriggerUserFetch =
    token !== null && user === null && isTokenValid();

  // 🚀 React Query handles side effects
  const { isLoading, isError } = useUserWithJwt({
    jwtAuthToken: token!,
    shouldTrigger: shouldTriggerUserFetch,
  });

  // Handle expired token immediately (no effect needed)
  if (token && !isTokenValid()) {
    logout();
  }

  const value = useMemo(
    () => ({
      token,
      loading: isLoading,
      errorOccured: isError,
      error: fetchError,
      user,
      logout,
      setUser,
      setToken,
      isUserAuthenticated,
    }),
    [token, isLoading, isError, fetchError, user],
  );

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
};
export default UserProfileProvider;
