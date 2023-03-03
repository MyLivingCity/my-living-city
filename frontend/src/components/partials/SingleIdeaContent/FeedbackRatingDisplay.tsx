import React,  { useEffect, useState } from "react";
import { Card, Col, Container, Row } from "react-bootstrap";
import { CanvasJSChart } from "src/lib/canvasjs";
import { IFeedbackRatingScaleAggregateSummary,
     IFeedbackRatingScaleValueBreakdown,
     IFeedbackRatingYesNoAggregateSummary }
      from "src/lib/types/data/feedbackRating.type";

interface FeedbackRatingScaleDisplayProps {
    feedbackRatingScaleValueBreakdown: IFeedbackRatingScaleValueBreakdown;
    feedbackRatingScaleSummary: IFeedbackRatingScaleAggregateSummary;
}

const FeedbackRatingScaleDisplay = ({
    feedbackRatingScaleValueBreakdown,
    feedbackRatingScaleSummary,
}: FeedbackRatingScaleDisplayProps) => {
    const { oneRatings, twoRatings, threeRatings, fourRatings } =
        feedbackRatingScaleValueBreakdown;
    const options = {
        // title: {
        //   text: 'Idea Ratings Breakdown',
        // },
        axisY: {
            title: "Number of Ratings",
        },
        data: [
            {
                type: "column",
                dataPoints: [
                    {
                        label: "1",
                        y: oneRatings,
                        color: "#E74236",
                    },
                    {
                        label: "2",
                        y: twoRatings,
                        color: "#EA5348",
                    },
                    {
                        label: "3",
                        y: threeRatings,
                        color: "#7A7A7A",
                    },
                    {
                        label: "4",
                        y: fourRatings,
                        color: "#99DC56",
                    },
                ],
            },
        ],
    };

    const { ratingAvg, ratingCount } = feedbackRatingScaleSummary;

    const aggregateBreakdown = [
        {
            title: "Average Rating",
            value: ratingAvg,
        },
        {
            title: "Number of Ratings",
            value: ratingCount,
        },
    ];

    return (
        <Container className="">
            <Row className="">
                {aggregateBreakdown &&
                    aggregateBreakdown.map(({ title, value }, index) => (
                        <Col key={index} className="text-center">
                            <Card>
                                <Card.Body className="d-flex justify-content-between d-md-block">
                                    <p className="my-auto">{title}</p>
                                    <p className="my-auto">{value}</p>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
            </Row>
            <div style={{ marginTop: "2rem" }}>
                <Row className="">
                    <CanvasJSChart options={options} />
                </Row>
            </div>
        </Container>
    );
};

export default FeedbackRatingScaleDisplay;
