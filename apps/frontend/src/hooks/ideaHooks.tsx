import { useQuery } from "react-query";
import { type IIdeaWithAggregations } from "src/lib/types/ideas/idea.types";
import { type IFetchError } from "src/lib/types/general/error.types";
import { postAllIdeasWithBreakdown } from "src/lib/api/idea.routes";

export const useIdeasHomepage = () => {
  return useQuery<IIdeaWithAggregations[], IFetchError>("ideas-homepage", () =>
    postAllIdeasWithBreakdown(12),
  );
};
