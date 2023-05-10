import React, { createContext, useContext, useEffect, useState } from 'react'
import { useUserWithJwt } from '../hooks/userHooks';
import { IUser } from '../lib/types/data/user.type';
import { ILoginWithEmailAndPass } from '../lib/types/input/loginWithEmailAndPass.input';
import { IFetchError } from '../lib/types/types';
import { retrieveStoredTokenExpiryInLocalStorage, storeObjectInLocalStorage, wipeLocalStorage } from '../lib/utilityFunctions';

export interface IUserProfileContext {
  token: string | null;
  loading: boolean;
  errorOccured: boolean;
  error: IFetchError | null;
  user: IUser | null;
  loginWithEmailAndPass?: (data: ILoginWithEmailAndPass) => void,
  logout: () => void,
  setUser: (data: IUser) => void,
  setToken: (str: string) => void,
  isUserAuthenticated: () => boolean,
}

export const UserProfileContext = createContext<IUserProfileContext>({
  // Initial values 
  token: null,
  loading: false,
  errorOccured: false,
  error: null,
  user: null,
  loginWithEmailAndPass: () => { },
  logout: () => { },
  setUser: () => { },
  setToken: () => { },
  isUserAuthenticated: () => false,
})


/**
 * Retrieves User object that is stored in local storage in Javascript object format
 * @returns {IUser} Retrieves User object from localstorage in Javascript Object format`
 */
const getUserFromLocalStorage = (): (IUser | null) => {
  const stringifiedUser = localStorage.getItem('logged-user');

  if (!stringifiedUser) {
    return null;
  }

  const loggedInUser = JSON.parse(stringifiedUser) as IUser
  return loggedInUser;
}

const UserProfileProvider: React.FC = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState<IUser | null>(getUserFromLocalStorage())
  const [fetchError, setFetchError] = useState<IFetchError | null>(null);

  /**
   * Checks to see if token is expired based on expiry date set in local storage.
   * 
   * @returns {boolean} False if token is expired True if token is still valid
   */
  const isTokenValid = (): boolean => {
    const tokenExpiry = retrieveStoredTokenExpiryInLocalStorage();
    const currentTime = new Date();
    if (!tokenExpiry) { return false }

    return currentTime <= tokenExpiry;
  }

  /**
   * Determines if the user should be fetched. If there is a token but no
   * user object then the user should be refetched. Any errors occured during this refetch
   * will be caught in the use effect and will automatically log user out if token is invalid.
   * @returns {boolean} True if user should be refetched false if not
   */
  const shouldTriggerUserFetch = (): boolean => {
    return (
      token !== null &&
      user === null &&
      isTokenValid()
    )
  }

  /**
   * Removes user object, token, and token expiry from 
   * global state as well as local storage. Logging user out.
   */
  const logout = () => {
    setToken(null);
    setUser(null);
    wipeLocalStorage();
  }

  const isUserAuthenticated = (): boolean => {
    return !!user && !!token;
  }

  const { data, isLoading, isError, error } = useUserWithJwt(
    { jwtAuthToken: token!, shouldTrigger: shouldTriggerUserFetch() }
  )

  /**
   * Checks to see if token is valid everytime component is initially loaded.
   */
  useEffect(() => {
    if (!isTokenValid()) {
      logout();
      setFetchError({ message: "Your session token has expired. Please login again." });
      return;
    }

    return setFetchError(null);
  }, [])

  /**
   * Checks to see if an error has occured upon retrieving user using JWT
   * and destroys localstorage state and user auth if error has occured.
   * If User is fetched using React query reupdates global state variable
   * to store newly fetched user. 
   */
  useEffect(() => {
    if (isError) {
      logout();
      setFetchError({ message: error?.response?.data.message });
      return;
    }

    if (!isLoading && data && !isError) {
      storeObjectInLocalStorage('logged-user', data);
      setFetchError(null);
      setUser(data);
    }
  }, [data, isLoading, isError])

  return (
    <UserProfileContext.Provider
      value={{
        logout,
        setUser,
        setToken,
        isUserAuthenticated,
        loading: isLoading,
        errorOccured: isError,
        error: fetchError,
        user: user,
        token,
      }}
    >
      { children}
    </UserProfileContext.Provider>
  )
}

export default UserProfileProvider