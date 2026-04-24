import axios from "axios";
import { API_BASE_URL } from "src/lib/constants/constants";
import { type ICategory } from "@/lib/types/home/category.types";

export const getAllCategories = async () => {
  const res = await axios.get<ICategory[]>(`${API_BASE_URL}/category/getall`);
  return res.data;
};

export const getSingleCategory = async (categoryId: string) => {
  const res = await axios.get<ICategory>(
    `${API_BASE_URL}/category/get/${categoryId}`,
  );
  return res.data;
};
