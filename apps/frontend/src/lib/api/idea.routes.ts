import { mlcApiClient } from "../mlcApiClient";

export const postAllIdeasWithBreakdown = async (take?: number) => {
  const endpoint = mlcApiClient.ideas.getAllWithAggregations;
  type Request = Required<Parameters<typeof endpoint>[0]>;

  const request: Request = {
    body: {
      take: take ?? undefined,
    },
  };

  const res = await endpoint({ body: request.body });
  return res.body;
};
