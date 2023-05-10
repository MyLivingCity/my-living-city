import { Button, Card } from "react-bootstrap";
import { BsPeople, BsHeartHalf } from "react-icons/bs";
import { AiOutlineStar } from "react-icons/ai";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const PlaceholderIdeaTile = () => {
  return (
    // <Card style={{ width: '18rem' }}>
    <Card style={{ position: "relative" }}>
      <Card.Body>
        <div style={{ textAlign: "left", color: "gray" }}>
          <Skeleton width={"25%"} />
        </div>
        <Card.Title>
          <Skeleton width={"75%"} />
        </Card.Title>
        <Card.Text>
          <Skeleton
            count={2}
            inline={true}
            width={"44%"}
            height={"90%"}
            style={{ marginRight: "0.5rem" }}
          />
          <Skeleton width={"90%"} height={"90%"} />
        </Card.Text>
        <div className="button-breakdown mt-3 d-flex justify-content-between align-items-center">
          <Button variant="primary" disabled>
            Read More
          </Button>

          <div className="d-flex align-content-center">
            <div className="px-2 text-muted d-flex flex-column justify-content-center align-items-center">
              <AiOutlineStar className="" />
              <p className="mb-0 user-select-none"></p>
            </div>
            <div className="px-2 text-muted d-flex flex-column justify-content-center align-items-center">
              <BsPeople className="" />
              <p className="mb-0 user-select-none"></p>
            </div>
            <div className="px-2 text-muted d-flex flex-column justify-content-center align-items-center">
              {/* Could possible have thumbs up and thumbs down but found heart to be clearer */}
              {/* <div className="">
                <FaRegThumbsUp />
                /
                <FaRegThumbsDown />
              </div> */}
              <BsHeartHalf />
              <p className="mb-0 user-select-none"></p>
            </div>
          </div>
        </div>
      </Card.Body>
      <Card.Footer>
        <small className="text-muted user-select-none">
          <Skeleton width={"50%"} />
        </small>
        {/* <small className='text-muted'>, {capitalizeFirstLetterEachWord(segmentName)}{subSegmentName ? ` at ${capitalizeFirstLetterEachWord(subSegmentName)}`: ""}</small> */}
        {/* <small className='text-muted'>-- {firstName}@{streetAddress}</small> */}
      </Card.Footer>
    </Card>
  );
};

export default PlaceholderIdeaTile;
