import React, { useEffect, useState } from "react";
import { Card, Col, Container, Row } from "react-bootstrap";
import { useQueryClient } from "react-query";
import { CanvasJSChart } from "../../../lib/canvasjs";
import {
  IComment,
  ICommentAggregateCount,
} from "../../../lib/types/data/comment.type";
import {
  IRatingAggregateSummary,
  IRatingValueBreakdown,
} from "../../../lib/types/data/rating.type";

interface RatingDisplayProps {
  ratingValueBreakdown: IRatingValueBreakdown;
  ratingSummary: IRatingAggregateSummary;
  commentAggregate: ICommentAggregateCount;
}

const RatingDisplay = ({
  ratingValueBreakdown,
  ratingSummary,
  commentAggregate,
}: RatingDisplayProps) => {
  const { strongDisagree, slightDisagree, neutral, slightAgree, strongAgree } =
    ratingValueBreakdown;
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
            label: "Strongly Oppose (-2)",
            y: strongDisagree,
            color: "#E74236",
          },
          {
            label: "Slightly Oppose (-1)",
            y: slightDisagree,
            color: "#EA5348",
          },
          {
            label: "Neutral (0)",
            y: neutral,
            color: "#7A7A7A",
          },
          {
            label: "Slightly Support (1)",
            y: slightAgree,
            color: "#99DC56",
          },
          {
            label: "Strongly Support (2)",
            y: strongAgree,
            color: "#8FD945",
          },
        ],
      },
    ],
  };

  const { negRatings, posRatings, ratingAvg, ratingCount } = ratingSummary;

  const { count: commentCount } = commentAggregate;

  // Create Array to Render Breakdown
  const aggregateBreakdown = [
    {
      title: "Rating Average:",
      value: ratingAvg.toFixed(2),
    },
    {
      title: "Interactions:",
      value: ratingCount + commentCount,
    },
    {
      title: "Positive to Negative:",
      value: `${posRatings}/${negRatings}`,
    },
  ];

  return (
    <Container className="">
      <Row className="">
        {aggregateBreakdown &&
          aggregateBreakdown.map(({ title, value }, idx) => (
            <Col key={idx} className="my-2" sm={12} md={4}>
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

export default RatingDisplay;
