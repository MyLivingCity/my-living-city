import { useContext, useEffect, useState } from 'react'
import { Button, Col, Container, Row, Alert } from 'react-bootstrap';
import { useParams } from 'react-router';
import { UserProfileContext } from '../../../contexts/UserProfile.Context';
// https://github.com/microsoft/TypeScript/issues/22217
// https://github.com/ekeric13/react-ratings-declarative
import Ratings from 'react-ratings-declarative';
import { useCreateRatingMutation } from 'src/hooks/ratingHooks';
import { IFetchError } from 'src/lib/types/types';

interface RatingInputProps {
  userHasRated: boolean,
  userSubmittedRating: number | null,
}

const RatingInput = ({ userHasRated, userSubmittedRating }: RatingInputProps) => {
  const { token, user } = useContext(UserProfileContext);
  const { ideaId } = useParams<{ ideaId: string }>();
  const [ ratingValue, setRatingValue ] = useState<number>(userSubmittedRating ?? 0);


  // =================== SUBMITTING RATING MUTATION ==========================
  const {
    submitRatingMutation,
    isLoading,
    isError,
    error,
    isSuccess
  } = useCreateRatingMutation(parseInt(ideaId), token, user);

  const [ showRatingSubmitError, setShowRatingSubmitError ] = useState(false);

  useEffect(() => {
    setShowRatingSubmitError(isError);
  }, [ isError ])
  
  const submitHandler = () => {
    const payload = {
      rating: ratingValue,
      ratingExplanation: ''
    };
    submitRatingMutation(payload);
  }

  // =================== UTILITY FUNCTIONS FOR UI/AGGREGATIONS ==========================
  const parseNegativeRatingValue = (val: number): void => {
    if (userHasRated) return;

    let parsedVal = -1 * val;
    setRatingValue(parsedVal);
  }

  const parsePositiveRatingValue = (val: number): void => {
    if (userHasRated) return;

    let parsedVal = val - 1;
    setRatingValue(parsedVal);
  }


  // Loads user submitted rating
  useEffect(() => {
    setRatingValue(userSubmittedRating ?? 0)
  }, [ userSubmittedRating ])

  // Helper functions
  const tokenExists = (): boolean => {
    return token != null;
  }

  const shouldButtonBeDisabled = (): boolean => {
    // Unauthenticated
    let flag = true;
    if (tokenExists()) flag = false;
    if (isLoading) flag = true;
    if (userHasRated) flag = true;
    return flag;
  }

  const buttonTextOutput = (): string => {
    // Unauthenticated
    let buttonText = 'Please login to comment';
    if (tokenExists()) buttonText = 'Share';
    if (isLoading) buttonText = 'Saving Comment';
    if (userHasRated) buttonText = 'You have already rated. You cannot rate an Idea twice.';
    if (!user) buttonText = 'You must sign in to rate an idea'
    return buttonText;
  }
  return (
    <Container className=''>
      <h2 className='text-center'>Submit Your Rating:</h2>
      <Row>
        <Col xs={12} className='text-center'>
          <Ratings
            rating={-1 * ratingValue}
            widgetRatedColors='red'
            widgetHoverColors='red'
            changeRating={parseNegativeRatingValue}
          >
            <Ratings.Widget />
            <Ratings.Widget />
          </Ratings>
          <Ratings
            rating={ratingValue < 0 ? 0 : ratingValue + 1}
            widgetRatedColors='gold'
            widgetHoverColors='gold'
            changeRating={parsePositiveRatingValue}
          >
            <Ratings.Widget
              widgetHoverColor='grey'
              widgetRatedColor='grey'
            />
            <Ratings.Widget />
            <Ratings.Widget />
          </Ratings>
        </Col>
        <Col xs={12} className='text-center mt-3'>
          {showRatingSubmitError && (
            <Alert
              className=''
              show={showRatingSubmitError}
              onClose={() => setShowRatingSubmitError(false)}
              dismissible
              variant='danger'
            >
              {error?.message ?? "An Error occured while trying to submit your rating."}
            </Alert>
          )}
          <Button
            onClick={submitHandler}
            disabled={shouldButtonBeDisabled()}
            size='lg'
          >
            {buttonTextOutput()}
          </Button>
        </Col>
      </Row>
    </Container>
  );
}

export default RatingInput