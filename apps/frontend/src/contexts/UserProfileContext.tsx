import { createContext } from "react";
import { type IUser } from "src/lib/types/user/user.types";
import { type IFetchError } from "src/lib/types/general/error.types";

export interface ILoginWithEmailAndPass {
  email: string;
  password: string;
}

export interface IUserProfileContext {
  token: string | null;
  loading: boolean;
  errorOccured: boolean;
  error: IFetchError | null;
  user: IUser | null;
  loginWithEmailAndPass?: (data: ILoginWithEmailAndPass) => void;
  logout: () => void;
  setUser: (data: IUser) => void;
  setToken: (str: string) => void;
  isUserAuthenticated: () => boolean;
}

export const UserProfileContext = createContext<IUserProfileContext>({
  token: null,
  loading: false,
  errorOccured: false,
  error: null,
  user: null,
  loginWithEmailAndPass: () => {},
  logout: () => {},
  setUser: () => {},
  setToken: () => {},
  isUserAuthenticated: () => false,
});
