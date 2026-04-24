import { useQuery } from "react-query";
import {
  getAllProposals,
  getSingleProposal,
  getSingleProposalByIdeaId,
  postAllProposalsWithBreakdown,
} from "src/lib/api/proposal.routes";
import { type IProposalWithAggregations } from "@/lib/types/ideas/proposal.types";
import { type IFetchError } from "@/lib/types/general/error.types";

export const useProposalsWithBreakdown = (take?: number) => {
  return useQuery<IProposalWithAggregations[], IFetchError>(
    ["proposal-breakdown", take],
    () => postAllProposalsWithBreakdown(take),
  );
};

export const useProposalsHomepage = () => {
  return useQuery<IProposalWithAggregations[], IFetchError>(
    "proposals-homepage",
    () => postAllProposalsWithBreakdown(3),
  );
};

export const useSingleProposal = (ProposalId: string) => {
  return useQuery<IProposalWithAggregations, IFetchError>(
    ["proposal", ProposalId],
    () => getSingleProposal(ProposalId),

    {
      staleTime: 45 * 60 * 1000, // 30 minutes
    },
  );
};

export const useSingleProposalByIdeaId = (IdeaId: string) => {
  return useQuery<IProposalWithAggregations, IFetchError>(
    ["proposal", IdeaId],
    () => getSingleProposalByIdeaId(IdeaId),

    {
      staleTime: 45 * 60 * 1000, // 30 minutes
    },
  );
};

export const useAllProposals = () => {
  return useQuery<IProposalWithAggregations[], IFetchError>("proposals", () =>
    getAllProposals(),
  );
};
