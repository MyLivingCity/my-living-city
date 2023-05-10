import axios from "axios";
import { API_BASE_URL } from "../constants";
import { IUserRole } from "../types/data/userRole.type";

export const getAllUserRoles = async () => {
  const res = await axios.get<IUserRole[]>(`${API_BASE_URL}/role/getall`);
  return res.data;
}