import { Button, Card } from 'react-bootstrap';
import { IIdeaWithAggregations } from '../../lib/types/data/idea.type';
import { timeDifference, truncateString } from '../../lib/utilityFunctions'
import { BsPeople, BsHeartHalf } from 'react-icons/bs'
import { AiOutlinePercentage } from 'react-icons/ai'
import { FaRegThumbsUp, FaRegThumbsDown } from 'react-icons/fa'

interface ideaTileProps {
  ideaData: IIdeaWithAggregations,
  showFooter: boolean,
}

const IdeaTile: React.FC<ideaTileProps> = ({ ideaData, showFooter }) => {
  const {
    id,
    title,
    description,
    updatedAt,
    ratingAvg,
    ratingCount,
    commentCount,
    posRatings,
    negRatings
  } = ideaData;
  return (
    // <Card style={{ width: '18rem' }}>
    <Card>
      {/* <Card.Img variant="top" src="https://via.placeholder.com/300x150" /> */}
      <Card.Body>
        <Card.Title>{truncateString(title, 50)}</Card.Title>
        <Card.Text>{truncateString(description, 100)}</Card.Text>
        <div className="button-breakdown mt-3 d-flex justify-content-between align-items-center">
          <Card.Link href={`/ideas/${id}`}>
            <Button variant="primary">Read more</Button>
          </Card.Link>
          <div className='d-flex align-content-center'>
            <div className="px-2 text-muted d-flex flex-column justify-content-center align-items-center">
              <AiOutlinePercentage className=''/>
              <p className='mb-0 user-select-none'>{ratingAvg.toFixed(2)}</p>
            </div>
            <div className="px-2 text-muted d-flex flex-column justify-content-center align-items-center">
              <BsPeople className='' />
              <p className='mb-0 user-select-none'>{ratingCount + commentCount}</p>
            </div>
            <div className="px-2 text-muted d-flex flex-column justify-content-center align-items-center">
              {/* Could possible have thumbs up and thumbs down but found heart to be clearer */}
              {/* <div className="">
                <FaRegThumbsUp />
                /
                <FaRegThumbsDown />
              </div> */}
              <BsHeartHalf />
              <p className='mb-0 user-select-none'>{posRatings}/{negRatings}</p>
            </div>
          </div>
        </div>
      </Card.Body>
      {showFooter && (
        <Card.Footer>
          <small className='text-muted user-select-none'>Updated {timeDifference(new Date(), new Date(updatedAt))}</small>
        </Card.Footer>
      )}
    </Card>
  );
}

export default IdeaTile