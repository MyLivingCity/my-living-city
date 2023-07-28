import React, { useState, useEffect } from 'react'
import { Button, Card } from "react-bootstrap";
import { IProposalWithAggregations } from "../../lib/types/data/proposal.type";
import {
  timeDifference,
  truncateString,
} from "../../lib/utilityFunctions";
import { BsPeople, BsHeartHalf } from "react-icons/bs";
import { AiOutlineStar } from "react-icons/ai";
import { getAllSuperSegments } from "../../lib/api/segmentRoutes";
import { ISuperSegment } from "../../lib/types/data/segment.type";
// import { FaRegThumbsUp, FaRegThumbsDown } from 'react-icons/fa'
const capitalizeString = (s: string) => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};
interface proposalTileProps {
  proposalData: IProposalWithAggregations;
  showFooter: boolean;
  postType?: string;
}

const ProposalTile: React.FC<proposalTileProps> = ({
  proposalData,
  showFooter,
  postType,
}) => {
  const { idea, id } = proposalData;


  const oneWeek = 604800000;
  const postDate = new Date(idea.updatedAt);
  const currentTime = new Date();
  const date = currentTime.getTime() - postDate.getTime();

  const isNew = date < oneWeek;
  const ratingAvgUpdated = Number(idea.ratingAvg);

  const [superSegments, setSuperSegments] = useState<ISuperSegment[]>([]);
  useEffect(() => {
    const fetchSuperSegments = async () => {
      try {
        const fetchedSuperSegments = await getAllSuperSegments();
        setSuperSegments(fetchedSuperSegments);
      } catch (error) {
        console.error(error);
        // handle error appropriately
      }
    };
  
    fetchSuperSegments();
  }, []);


const superSegmentName = superSegments.find(superSegment => superSegment.superSegId === proposalData.idea.superSegId)?.name || '';

  return (
    // <Card style={{ width: '18rem' }}>
    <Card>
      {/* <Card.Img variant="top" src="https://via.placeholder.com/300x150" /> */}
      <style>
        {`
          .new-banner {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background-color: #93cb6e;
            color: #fff;
            padding: 0.5rem;
            font-size: 0.8rem;
          }
        `}
      </style>
      {isNew && <div className="new-banner p-1">NEW</div>}
      <Card.Body>
        <div className="mb-1" style={{ textAlign: "left", color: "gray" }}>{postType}</div>
        <Card.Title>{idea ? truncateString(idea.title, 50) : "N/A"}</Card.Title>
        <Card.Text>{truncateString(idea.description, 100)}</Card.Text>
        <div className="button-breakdown mt-3 d-flex justify-content-between align-items-center">
          <Card.Link href={`/proposals/${id}`}>
            <Button variant="primary">Read more</Button>
          </Card.Link>
          <div className="d-flex align-content-center">
            <div className="px-2 text-muted d-flex flex-column justify-content-center align-items-center">
              <AiOutlineStar className="" />
              <p className="mb-0 user-select-none">
                {ratingAvgUpdated.toFixed(1)}
              </p>
            </div>
            <div className="px-2 text-muted d-flex flex-column justify-content-center align-items-center">
              <BsPeople className="" />
              <p className="mb-0 user-select-none">
                {Number(idea.ratingCount) + Number(idea.commentCount)}
              </p>
            </div>
            <div className="px-2 text-muted d-flex flex-column justify-content-center align-items-center">
              {/* Could possible have thumbs up and thumbs down but found heart to be clearer */}
              {/* <div className="">
                <FaRegThumbsUp />
                /
                <FaRegThumbsDown />
              </div> */}
              <BsHeartHalf />
              <p className="mb-0 user-select-none">
                {idea.posRatings}/{idea.negRatings}
              </p>
            </div>
          </div>
        </div>
      </Card.Body>
      {showFooter && (
        <Card.Footer className="d-flex justify-content-between">
          <small className="text-muted user-select-none">
            Updated {timeDifference(new Date(), new Date(idea.updatedAt))}
          </small>
          <div className="text-right">
            <small className='text-muted user-select-none'>
              {idea.subSegmentName ? ` ${capitalizeString(idea.segmentName)}\/${capitalizeString(idea.subSegmentName)}` :
                idea.segmentName ? ` ${capitalizeString(idea.segmentName)}` :
                  superSegmentName ? ` ${capitalizeString(superSegmentName)}` : ""}
            </small>
          </div>
        </Card.Footer>
      )}
    </Card>
  );
};

export default ProposalTile;
