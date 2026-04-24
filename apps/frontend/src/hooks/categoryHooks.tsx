import { useQuery } from "react-query";
import { type ICategory } from "@/lib/types/home/category.types";
import { type IFetchError } from "@/lib/types/general/error.types";
import {
  getAllCategories,
  getSingleCategory,
} from "src/lib/api/category.routes";

export const useCategories = () => {
  return useQuery<ICategory[], IFetchError>("categories", getAllCategories);
};

export const useSingleCategory = (categoryId: string) => {
  return useQuery<ICategory, IFetchError>(["category", categoryId], () =>
    getSingleCategory(categoryId),
  );
};
