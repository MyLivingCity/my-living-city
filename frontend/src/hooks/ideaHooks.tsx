import { useQuery } from "react-query";
import {
  IIdeaWithAggregations,
  IIdeaWithRelationship,
} from "../lib/types/data/idea.type";
import { IFetchError } from "../lib/types/types";
import {
  getSingleIdea,
  postAllIdeasWithBreakdown,
  getUserIdeas,
  getIdeasFollowedByUser,
  isIdeaFollowedByUser,
  getIdeasEndorsedByUser,
  isIdeaEndorsedByUser,
  getEndorsedUsersByIdea,
  isIdeaFlaggedByUser
} from "../lib/api/ideaRoutes";

// export const useIdeas = (
// ) => {
//   return useQuery<IIdeaBad[], FetchError>(
//     'ideas',
//     () => getAllIdeas(),
//   );
// }

// export const useIdeasWithSort = (
//   sortingOptions: GetAllIdeasWithSort = getAllIdeasWithSortDefault
// ) => {
//   return useQuery<IIdeaBad[], FetchError>(
//     ['ideas', sortingOptions],
//     () => postAllIdeasWithSort(sortingOptions),
//   );
// }

export const useIdeasWithBreakdown = (take?: number) => {
  return useQuery<IIdeaWithAggregations[], IFetchError>(
    ["ideas-breakdown", take],
    () => postAllIdeasWithBreakdown(take)
  );
};

export const useIdeasHomepage = () => {
  return useQuery<IIdeaWithAggregations[], IFetchError>("ideas-homepage", () =>
    postAllIdeasWithBreakdown(12)
  );
};

export const useSingleIdea = (ideaId: string) => {
  return useQuery<IIdeaWithRelationship, IFetchError>(
    ["idea", ideaId],
    () => getSingleIdea(ideaId),
    // https://react-query.tanstack.com/guides/initial-query-data#staletime-and-initialdataupdatedat
    {
      staleTime: 45 * 60 * 1000, // 30 minutes
    }
  );
};

export const useUserIdeas = (userId: string) => {
  return useQuery<IIdeaWithAggregations[], IFetchError>("user-ideas", () =>
    getUserIdeas(userId)
  );
};

export const useUserFollowedIdeas = (userId: string) => {
  return useQuery<IIdeaWithAggregations[], IFetchError>("user-followed-ideas", () => 
  getIdeasFollowedByUser(userId))
}

export const useCheckIdeaFollowedByUser = (token: string|null, userId: string|null, ideaId: string|null) => {
  return useQuery<any, IFetchError>("is-idea-followed-by-user", () => 
    isIdeaFollowedByUser(token, userId, ideaId))
}

export const useUserEndorsedIdeas = (userId: string) => {
  return useQuery<IIdeaWithAggregations[], IFetchError>("user-endorsed-ideas", () => 
  getIdeasEndorsedByUser(userId))
}

export const useCheckIdeaEndorsedByUser = (token: string|null, userId: string|null, ideaId: string|null) => {
  return useQuery<any, IFetchError>("is-idea-endorsed-by-user", () => 
    isIdeaEndorsedByUser(token, userId, ideaId))
}

export const useGetEndorsedUsersByIdea = (token: string|null, ideaId: string) => {
  return useQuery<any, IFetchError>("idea-endorsed-users", () => 
    getEndorsedUsersByIdea(token, ideaId))
}

export const useCheckIdeaFlaggedByUser = (token: string|null, userId: string|null, ideaId: string|null) => {
  return useQuery<Boolean, IFetchError>("is-idea-flagged-by-user", () => 
    isIdeaFlaggedByUser(token, userId, ideaId))
}