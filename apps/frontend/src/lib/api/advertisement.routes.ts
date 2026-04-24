import axios from "axios";
import { API_BASE_URL } from "src/lib/constants/constants";
import { type IAdvertisement } from "src/lib/types/home/advertisement.types";

export const getPublishedAdvertisement = async () => {
  const res = await axios.get<IAdvertisement[]>(
    `${API_BASE_URL}/advertisement/getAllPublished`,
  );
  return res.data;
};
