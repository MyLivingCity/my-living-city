import React, { useContext, useEffect, useState } from "react";
import { Container, Row } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useCommentAggregateUnderIdea } from "src/hooks/commentHooks";
import { UserProfileContext } from "../../../contexts/UserProfile.Context";
import { useAllRatingsUnderIdea } from "../../../hooks/ratingHooks";
import { IRating, IRatingAggregateSummary } from "../../../lib/types/data/rating.type";
import {
  checkIfUserHasRated,
  findUserRatingSubmission,
  getRatingAggregateSummary,
} from "../../../lib/utilityFunctions";
import LoadingSpinner from "../../ui/LoadingSpinner";
import RatingDisplay from "./RatingDisplay";
import RatingInput from "./RatingInput";
import { IFetchError } from "src/lib/types/types";
import { UseQueryResult } from "react-query";

interface RatingsSectionProps {
  ideaId: string;
  useAllRatingsUnderIdeaProps: UseQueryResult<IRating[], IFetchError>;
}

const RatingsSection: React.FC<RatingsSectionProps> = ({ ideaId, useAllRatingsUnderIdeaProps }) => {
  const { user } = useContext(UserProfileContext);
 
  const {
    data: ratings,
    isLoading,
    isError,
    error,
  } = useAllRatingsUnderIdeaProps;
  const {
    data: commentAggregate,
    isLoading: aggregateIsLoading,
    isError: aggregateIsError,
    error: aggregateError,
  } = useCommentAggregateUnderIdea(ideaId);
  const [userHasRated, setUserHasRated] = useState<boolean>(
    checkIfUserHasRated(ratings, user?.id)
  );
  const [userSubmittedRating, setUserHasSubmittedRating] = useState<
    number | null
  >(findUserRatingSubmission(ratings, user?.id));
  const [ratingSummary, setRatingSummary] = useState<IRatingAggregateSummary>(
    getRatingAggregateSummary(ratings)
  );

  useEffect(() => {
    setRatingSummary(getRatingAggregateSummary(ratings));
    setUserHasRated(checkIfUserHasRated(ratings, user?.id));
    setUserHasSubmittedRating(findUserRatingSubmission(ratings, user?.id));
  }, [ratings]);

  if ((error && isError) || (aggregateIsError && aggregateError)) {
    return <p>An error occured while fetching comments</p>;
  }

  if (isLoading || aggregateIsLoading) {
    return <LoadingSpinner />;
  }

  const { ratingValueBreakdown } = ratingSummary;
  return (
    <Container className="">
      <Row className="py-5">
        <h2 className="mx-auto">Ratings Breakdown</h2>
        {ratingValueBreakdown && commentAggregate && (
          <RatingDisplay
            ratingValueBreakdown={ratingValueBreakdown}
            ratingSummary={ratingSummary}
            commentAggregate={commentAggregate}
          />
        )}
      </Row>
      {user && (
        <Row className="py-5 bg-mlc-shade-grey">
          <RatingInput
            ideaId={ideaId}
            userHasRated={userHasRated}
            userSubmittedRating={userSubmittedRating}
          />
        </Row>
      )}
    </Container>
  );
};

export default RatingsSection;
