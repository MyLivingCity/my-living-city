import { useContext, useEffect, useState } from "react";
import { Button, Col, Container, Row, Alert } from "react-bootstrap";
import { UserProfileContext } from "../../../contexts/UserProfile.Context";
// https://github.com/microsoft/TypeScript/issues/22217
// https://github.com/ekeric13/react-ratings-declarative
import { useCreateRatingMutation } from "src/hooks/ratingHooks";
import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
} from "@mui/material";

interface RatingInputProps {
  userHasRated: boolean;
  userSubmittedRating: number | null;
  ideaId: string;
}

const RatingInput = ({
  ideaId,
  userHasRated,
  userSubmittedRating,
}: RatingInputProps) => {
  const { token, user } = useContext(UserProfileContext);
  const [ratingValue, setRatingValue] = useState<number>(
    userSubmittedRating ?? 0
  );

  

  // =================== SUBMITTING RATING MUTATION ==========================
  const { submitRatingMutation, isLoading, isError, error, isSuccess } =
    useCreateRatingMutation(parseInt(ideaId), token, user);

  const [showRatingSubmitError, setShowRatingSubmitError] = useState(false);

  useEffect(() => {
    setShowRatingSubmitError(isError);
  }, [isError]);

  const submitHandler = () => {
    const payload = {
      rating: ratingValue,
      ratingExplanation: "",
    };
    submitRatingMutation(payload);
  };

  // Loads user submitted rating
  useEffect(() => {
    setRatingValue(userSubmittedRating ?? 0);
  }, [userSubmittedRating]);

  // Helper functions
  const tokenExists = (): boolean => {
    return token != null;
  };

  const shouldButtonBeDisabled = (): boolean => {
    // Unauthenticated
    let flag = true;
    if (tokenExists()) flag = false;
    if (isLoading) flag = true;
    if (userHasRated) flag = true;
    return flag;
  };

  const buttonTextOutput = (): string => {
    // Unauthenticated
    let buttonText = "Please login to comment";
    if (tokenExists()) buttonText = "Submit";
    if (isLoading) buttonText = "Saving Comment";
    if (userHasRated) buttonText = "Submit";
    if (!user) buttonText = "You must sign in to rate an idea";
    return buttonText;
  };

  return (
    <div>
    {userHasRated ? (<h2 className="text-center" >You have already rated this idea</h2>): (
    <Container className="">
      <style>
        {`
        .canvasjs-chart-credit {
          display: none;
        }
        `}
      </style>
      <h2 className="text-center">Submit Your Rating:</h2>
      <Row>
        <Col>
          <div>
            <FormControl
              style={{ width: "100%", padding: "0rem 8rem 0rem 8rem" }}
            >
              <RadioGroup
                row
                aria-labelledby="demo-form-control-label-placement"
                name="position"
                defaultValue="top"
                style={{ justifyContent: "space-between" }}
                onChange={(e) => setRatingValue(parseInt(e.target.value))}
              >
                <FormControlLabel
                  value="-2"
                  control={<Radio color="success" />}
                  label="Strongly Oppose"
                  labelPlacement="bottom"
                  disabled={shouldButtonBeDisabled()}
                />
                <FormControlLabel
                  value="-1"
                  control={<Radio color="success" />}
                  label="Slightly Oppose"
                  labelPlacement="bottom"
                  disabled={shouldButtonBeDisabled()}
                />
                <FormControlLabel
                  value="0"
                  control={<Radio color="success" />}
                  label="Neutral"
                  labelPlacement="bottom"
                  disabled={shouldButtonBeDisabled()}
                />
                <FormControlLabel
                  value="1"
                  control={<Radio color="success" />}
                  label="Slightly Support"
                  labelPlacement="bottom"
                  disabled={shouldButtonBeDisabled()}
                />
                <FormControlLabel
                  value="2"
                  control={<Radio color="success" />}
                  label="Strongly Support"
                  labelPlacement="bottom"
                  disabled={shouldButtonBeDisabled()}
                />
              </RadioGroup>
            </FormControl>
          </div>
        </Col>
        <Col xs={12} className="text-center mt-3">
          {showRatingSubmitError && (
            <Alert
              className=""
              show={showRatingSubmitError}
              onClose={() => setShowRatingSubmitError(false)}
              dismissible
              variant="danger"
            >
              {error?.message ??
                "An Error occured while trying to submit your rating."}
            </Alert>
          )}
          {!userHasRated && (
          <Button
            onClick={submitHandler}
            disabled={shouldButtonBeDisabled()}
            size="lg"
          >
            {buttonTextOutput()}
          </Button>
          )}
        </Col>
      </Row>
    </Container>
    )}
    </div>
  );
};

export default RatingInput;
