import { useQuery } from "react-query";
import {
  IProposalWithAggregations,
  IProposalWithRelationship,
} from "../lib/types/data/proposal.type";
import { IFetchError } from "../lib/types/types";
import {
  getSingleProposal,
  postAllProposalsWithBreakdown,
} from "../lib/api/proposalRoutes";

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

export const useProposalsWithBreakdown = (take?: number) => {
  return useQuery<IProposalWithAggregations[], IFetchError>(
    ["proposal-breakdown", take],
    () => postAllProposalsWithBreakdown(take)
  );
};

export const useProposalsHomepage = () => {
  return useQuery<IProposalWithAggregations[], IFetchError>(
    "proposals-homepage",
    () => postAllProposalsWithBreakdown(3)
  );
};

export const useSingleProposal = (ProposalId: string) => {
  return useQuery<IProposalWithAggregations, IFetchError>(
    ["proposal", ProposalId],
    () => getSingleProposal(ProposalId),
    // https://react-query.tanstack.com/guides/initial-query-data#staletime-and-initialdataupdatedat
    {
      staleTime: 45 * 60 * 1000, // 30 minutes
    }
  );
};
