import React, { useContext, useEffect, useState } from 'react';
import { Container, Row } from 'react-bootstrap';
import { UserProfileContext } from '../../../contexts/UserProfile.Context';
import { useAllFeedbackRatingsUnderFeedback } from 'src/hooks/feedbackRatingHooks';
import { IFeedbackRatingYesNoAggregateSummary, IFeedbackRatingScaleAggregateSummary } from 'src/lib/types/data/feedbackRating.type';
import {
    checkIfUserHasRated,
    findUserFeedbackRatingSubmission,
    getFeedbackRatingYesNoAggregateSummary,
    getFeedbackRatingScaleAggregateSummary,
} from 'src/lib/utilityFunctions';
import LoadingSpinner from '../../ui/LoadingSpinner';
import { FeedbackRatingYesNoDisplay, FeedbackRatingScaleDisplay } from './FeedbackRatingDisplay';
import { FeedbackRatingYesNoInput, FeedbackRatingScaleInput } from './FeedbackRatingInput';
interface FeedbackRatingsSectionProps {
    feedbackId: string;
    proposalId: string;
}

const FeedbackRatingYesNoSection: React.FC<FeedbackRatingsSectionProps> = ({
    feedbackId,
    proposalId,
}) => {
    const { user } = useContext(UserProfileContext);

    const {
        data: feedbackRatings,
        isLoading,
        isError,
        error,
        refetch
    } = useAllFeedbackRatingsUnderFeedback(feedbackId, proposalId);

    const [userHasRated, setUserHasRated] = useState<boolean>(
        checkIfUserHasRated(feedbackRatings, user?.id)
    );
    const [userSubmittedRating, setUserHasSubmittedRating] = useState<
        number | null
    >(findUserFeedbackRatingSubmission(feedbackRatings, user?.id));
    const [feedbackRatingSummary, setFeedbackRatingSummary] = useState<
        IFeedbackRatingYesNoAggregateSummary
    >(getFeedbackRatingYesNoAggregateSummary(feedbackRatings));

    useEffect(() => {
        setFeedbackRatingSummary(
            getFeedbackRatingYesNoAggregateSummary(feedbackRatings)
        );
        setUserHasRated(checkIfUserHasRated(feedbackRatings, user?.id));
        setUserHasSubmittedRating(
            findUserFeedbackRatingSubmission(feedbackRatings, user?.id)
        );
    }, [feedbackRatings]);

    if (error && isError) {
        return <p>An error occured while fetching comments</p>;
    }

    if (isLoading) {
        return <LoadingSpinner />;
    }
    return (
        <Container>
            <Row>
                {feedbackRatingSummary && (
                    <FeedbackRatingYesNoDisplay
                        feedbackRatingYesNoSummary={feedbackRatingSummary}
                    />
                )}
            </Row>
            <Row>
                {user && (
                    <FeedbackRatingYesNoInput
                        feedbackId={feedbackId}
                        proposalId={proposalId}
                        userHasRated={userHasRated}
                        userSubmittedRating={userSubmittedRating}
                        refetchData={refetch}
                    />
                )}
            </Row>
        </Container>
    );
};

const FeedbackRatingScaleSection: React.FC<FeedbackRatingsSectionProps> = ({
    feedbackId,
    proposalId,
}) => {
    const { user } = useContext(UserProfileContext);

    const {
        data: feedbackRatings,
        isLoading,
        isError,
        error,
        refetch
    } = useAllFeedbackRatingsUnderFeedback(feedbackId, proposalId);

    const [userHasRated, setUserHasRated] = useState<boolean>(
        checkIfUserHasRated(feedbackRatings, user?.id)
    );
    const [userSubmittedRating, setUserHasSubmittedRating] = useState<
        number | null
    >(findUserFeedbackRatingSubmission(feedbackRatings, user?.id));
    const [feedbackRatingSummary, setFeedbackRatingSummary] = useState<
        IFeedbackRatingScaleAggregateSummary
    >(getFeedbackRatingScaleAggregateSummary(feedbackRatings));

    useEffect(() => {
        setFeedbackRatingSummary(
            getFeedbackRatingScaleAggregateSummary(feedbackRatings)
        );
        setUserHasRated(checkIfUserHasRated(feedbackRatings, user?.id));
        setUserHasSubmittedRating(
            findUserFeedbackRatingSubmission(feedbackRatings, user?.id)
        );
    }, [feedbackRatings]);

    if (error && isError) {
        return <p>An error occured while fetching comments</p>;
    }

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <Container>
            <Row>
                {feedbackRatingSummary && (
                    <FeedbackRatingScaleDisplay
                        feedbackRatingScaleSummary={feedbackRatingSummary}
                    />
                )}
            </Row>
            <Row>
                {user && (
                    <FeedbackRatingScaleInput
                        feedbackId={feedbackId}
                        proposalId={proposalId}
                        userHasRated={userHasRated}
                        userSubmittedRating={userSubmittedRating}
                        refetchData={refetch}
                    />
                )}
            </Row>
        </Container>
    );
};

export { FeedbackRatingYesNoSection, FeedbackRatingScaleSection };