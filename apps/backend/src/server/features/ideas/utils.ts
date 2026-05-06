import { UserSchema } from "@mlc/lib/api";
import { Prisma } from "#prisma/client";
import { prisma } from "src/prisma/client";
import z from "zod";
import { env } from "src/lib/env";

const PROPOSAL_RATING_COUNT = env.PROPOSAL_RATING_COUNT;
const PROPOSAL_RATING_AVG = env.PROPOSAL_RATING_AVG;
const PROJECT_RATING_COUNT = env.PROJECT_RATING_COUNT;
const PROJECT_RATING_AVG = env.PROJECT_RATING_AVG;

export const checkIdeaThresholds = async (ideaId: number) => {
  const foundIdea = await prisma.idea.findUnique({ where: { id: ideaId } });

  if (!foundIdea) {
    throw new Error(`The idea with that listed ID (${ideaId}) does not exist.`);
  }

  const ratingAggregations = await prisma.ideaRating.aggregate({
    where: { ideaId },
    _avg: { rating: true },
    _count: true,
  });

  const ratingAvg = ratingAggregations._avg.rating || 0;
  const ratingCount = ratingAggregations._count || 0;

  return {
    triggerProposalAdvancement:
      PROPOSAL_RATING_AVG <= ratingAvg &&
      PROPOSAL_RATING_COUNT <= ratingCount &&
      foundIdea.state === "IDEA",
    triggerProjectAdvancement:
      PROJECT_RATING_AVG <= ratingAvg &&
      PROJECT_RATING_COUNT <= ratingCount &&
      (foundIdea.state === "IDEA" || foundIdea.state === "PROPOSAL"),
    isChampionable:
      foundIdea.championId == null &&
      PROPOSAL_RATING_AVG <= ratingAvg &&
      PROPOSAL_RATING_COUNT <= ratingCount,
  };
};

type UserSchemaType = z.infer<typeof UserSchema>;

export async function getAggregateIdeaWithUserSegmentJoins(
  userId: UserSchemaType["id"],
  limitSql: Prisma.Sql,
) {
  return await prisma.$queryRaw<Record<string, unknown>[]>(Prisma.sql`
        select
          i.id,
          i.author_id as "authorId",
          i.category_id as "categoryId",
          i.title,
          i.description,
          i.proposal_role,
          i.requirements,
          i.proposal_benefits,
          i.notification_dismissed,
          i.quarantined_at,
          seg.seg_id as "segId",
          seg.segment_name as "segmentName",
          subseg.seg_id as "subSegId",
          subseg.segment_name as "subSegmentName",
          superseg.seg_id as "superSegId",
          i.community_impact as "communityImpact",
          i.nature_impact as "natureImpact",
          i.energy_impact as "energyImpact",
          i.manufacturing_impact as "manufacturingImpact",
          i.arts_impact as "artsImpact",
          coalesce(ic.total_comments + ir.total_ratings, 0) as engagements,
          coalesce(ir.avg_rating, 0) as "ratingAvg",
          coalesce(ic.total_comments, 0) as "commentCount",
          coalesce(ir.total_ratings, 0) as "ratingCount",
          coalesce(pr.pos_rating, 0) as "posRatings",
          coalesce(nr.neg_rating, 0) as "negRatings",
          coalesce(userfname.organization_name, userfname.f_name, '') as "firstName",
          coalesce(userStreetAddress.street_address, '') as "streetAddress",
          i.state,
          i.active,
          i.banned,
          i.reviewed,
          i.updated_at as "updatedAt",
          i.created_at as "createdAt"
        from idea i
        left join (
          select
            idea_id,
            count(id) as total_comments
          from idea_comment
          group by idea_comment.idea_id
        ) ic on i.id = ic.idea_id
        left join (
          select
            idea_id,
            count(id) as total_ratings,
            avg(rating) as avg_rating
          from idea_rating
          group by idea_rating.idea_id
        ) ir on i.id = ir.idea_id
        left join (
          select
            idea_id,
            count(id) as neg_rating
          from idea_rating
          where rating < 0
          group by idea_id
        ) nr on i.id = nr.idea_id
        left join (
          select
            idea_id,
            count(id) as pos_rating
          from idea_rating
          where rating > 0
          group by idea_id
        ) pr on i.id = pr.idea_id
        left join (
          select s.*, iseg."A" as idea_id
          from "_IdeaToSegments" iseg
          join segment s on s.seg_id = iseg."B"
          where s."segmentType" = 'segment'
        ) seg on seg.idea_id = i.id
        left join (
          select s.*, iseg."A" as idea_id
          from "_IdeaToSegments" iseg
          join segment s on s.seg_id = iseg."B"
          where s."segmentType" = 'subSegment'
        ) subseg on subseg.idea_id = i.id
        left join (
          select s.*, iseg."A" as idea_id
          from "_IdeaToSegments" iseg
          join segment s on s.seg_id = iseg."B"
          where s."segmentType" = 'superSegment'
        ) superseg on superseg.idea_id = i.id
        left join (
          select id, f_name, organization_name
          from "user"
        ) userfname on i.author_id = userfname.id
        left join (
          select user_id, street_address
          from user_address
        ) userStreetAddress on i.author_id = userStreetAddress.user_id
        where i.author_id = ${userId}
        order by
          "ratingCount" desc,
          "ratingAvg" desc,
          updated_at desc,
          engagements desc
        ${limitSql}
      `);
}
