import { IAddressInput } from "./address.input";
import { IGeoInput } from "./geo.input";

export interface IRegisterInput {
  userRoleId?: number;
  email: string;
  password: string;
  confirmPassword: string;
  fname?: string;
  lname?: string;
  address?: IAddressInput;
  geo?: IGeoInput;
  profImage?: File;
}