import axios from "axios";
import { API_BASE_URL } from "@/lib/constants/constants";
import { type PublicSubGroup } from "@/types/publicProfile.types";

export const getPublicSubGroups = async (
  userId: string,
  token: string | null,
): Promise<PublicSubGroup[]> => {
  const headers = {
    "Content-Type": "application/json",
    "x-auth-token": token,
    "Access-Control-Allow-Origin": "*",
  };
  const res = await axios.get<PublicSubGroup[]>(
    `${API_BASE_URL}/publicSubgroup/${userId}`,
    { headers },
  );
  return res.data;
};
