
// WARNING: If schema changes and names are changed this will have to be changed as well
export interface IIdeaOrderByAggregate {
  id?: SortOrder
  authorId?: SortOrder
  categoryId?: SortOrder
  title?: SortOrder
  description?: SortOrder
  communityImpact?: SortOrder
  natureImpact?: SortOrder
  artsImpact?: SortOrder
  energyImpact?: SortOrder
  manufacturingImpact?: SortOrder
  state?: SortOrder
  active?: SortOrder
  createdAt?: SortOrder
  updatedAt?: SortOrder
}

type SortOrder = 'asc' | 'desc'

export const defaultOrderByAggregate: IIdeaOrderByAggregate = {
  updatedAt: 'desc'
}


export interface IGetAllIdeasWithSort {
  orderBy?: IIdeaOrderByAggregate,
  take?: number,
}

export const getAllIdeasWithSortDefault: IGetAllIdeasWithSort = {
  orderBy: {
    updatedAt: 'desc'
  }
}