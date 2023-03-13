import React,  { useEffect, useState } from "react";
import { Card, Col, Container, Row } from "react-bootstrap";
import { CanvasJSChart } from "src/lib/canvasjs";
import { IFeedbackRatingScaleAggregateSummary,
     IFeedbackRatingYesNoAggregateSummary }
      from "src/lib/types/data/feedbackRating.type";

interface FeedbackRatingScaleDisplayProps {
    feedbackRatingScaleSummary: IFeedbackRatingScaleAggregateSummary;
}

interface FeedbackRatingYesNoDisplayProps {
    feedbackRatingYesNoSummary: IFeedbackRatingYesNoAggregateSummary;
}

const FeedbackRatingScaleDisplay = ({
    feedbackRatingScaleSummary,
}: FeedbackRatingScaleDisplayProps) => {

    const { ratingAvg } = feedbackRatingScaleSummary;

    return (
        <Container className="">
            <Row className="">
                <p>Average Rating: {ratingAvg}</p>
            </Row>
        </Container>
    );
};

const FeedbackRatingYesNoDisplay = ({
    feedbackRatingYesNoSummary,
}: FeedbackRatingYesNoDisplayProps) => {
    const { yesRatings, noRatings} = feedbackRatingYesNoSummary;
    const yesToNo = `${yesRatings}/${noRatings}`;

    return (
        <Container className="">
            <Row className="">
                <p> Yes to No: {yesToNo} </p>
            </Row>
        </Container>
    )
}
export { FeedbackRatingScaleDisplay, FeedbackRatingYesNoDisplay };
