import { useQuery } from "react-query";
import { type IFetchError } from "src/lib/types/general/error.types";
import { type IAdvertisement } from "src/lib/types/home/advertisement.types";
import { getPublishedAdvertisement } from "src/lib/api/advertisement.routes";

export const usePublishedAds = () => {
  return useQuery<IAdvertisement[], IFetchError>(
    "AllPublished",
    getPublishedAdvertisement,
  );
};
