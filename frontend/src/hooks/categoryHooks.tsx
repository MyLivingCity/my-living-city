import { useQuery } from "react-query"
import { ICategory } from "../lib/types/data/category.type"
import { IFetchError } from "../lib/types/types"
import { getAllCategories, getSingleCategory } from "../lib/api/categoryRoutes"

export const useCategories = () => {
  return useQuery<ICategory[], IFetchError>(
    'categories',
    getAllCategories
  )
}

export const useSingleCategory = (categoryId: string) => {
  return useQuery<ICategory, IFetchError>(
    ['category', categoryId],
    () => getSingleCategory(categoryId),
  )
}