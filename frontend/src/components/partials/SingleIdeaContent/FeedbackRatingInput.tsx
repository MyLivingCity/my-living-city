import { useContext, useEffect, useState } from "react";
import { Button, Container, Row, Alert } from "react-bootstrap";
import { UserProfileContext } from "src/contexts/UserProfile.Context";
import { useCreateFeedbackRatingMutation } from "src/hooks/feedbackRatingHooks";
import {
    FormControl,
    FormControlLabel,
    Radio,
    RadioGroup,
} from "@mui/material";

interface FeedbackRatingInputProps {
    userHasRated: boolean;
    userSubmittedRating: number | null;
    proposalId: string;
    feedbackId: string;
}

const FeedbackRatingYesNoInput = ({
    proposalId,
    feedbackId,
    userHasRated,
    userSubmittedRating,
}: FeedbackRatingInputProps) => {
    const { token, user } = useContext(UserProfileContext);
    const [ratingValue, setRatingValue] = useState<number>(
        userSubmittedRating ?? 0
    );

    // =================== SUBMITTING RATING MUTATION ==========================
    const {
        submitRatingMutation,
        isLoading,
        isError,
        error,
        isSuccess,
    } = useCreateFeedbackRatingMutation(
        parseInt(proposalId),
        parseInt(feedbackId),
        token,
        user
    );

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

    const tokenExists = (): boolean => {
        return token != null;
    };

    const shouldButtonBeDisabled = (): boolean => {
        let flag = true;
        if (tokenExists()) flag = false;
        if (isLoading) flag = true;
        if (userHasRated) flag = true;
        return flag;
    };

    const buttonTextOutput = (): string => {
        let buttonText = "Please login to submit rating";
        if (tokenExists()) buttonText = "Submit";
        if (isLoading) buttonText = "Submitting...";
        if (userHasRated) buttonText = "You have already rated this feedback";
        return buttonText;
    };

    // =================== UTILITY FUNCTIONS FOR UI/AGGREGATIONS ==========================
    // const parseNegativeRatingValue = (val: number): void => {
    //   if (userHasRated) return;

    //   let parsedVal = -1 * val;
    //   setRatingValue(parsedVal);
    // };

    // const parsePositiveRatingValue = (val: number): void => {
    //   if (userHasRated) return;
    //   setRatingValue(val);
    // };

    return (
        <Container>
            <Row>
                <FormControl
                    component="fieldset"
                    style={{ width: "100%", padding: "0rem 0rem 0rem 0rem" }}>
                    <RadioGroup
                        row
                        aria-label="rating"
                        name="rating"
                        value={ratingValue}
                        onChange={(e) => setRatingValue(parseInt(e.target.value))}
                        sx={{ width: "70%", height: "70%" }}
                    >
                        <FormControlLabel
                            value={1}
                            control={<Radio />}
                            label="Yes"
                            sx = {{
                                '& .MuiSvgIcon-root': {
                                    fontSize: 18,
                                  },
                                '& .MuiTypography-root': {
                                    fontSize: 13,
                                },
                            }}
                            disabled={shouldButtonBeDisabled()}
                        />
                        <FormControlLabel
                            value={2}
                            control={<Radio />}
                            label="No"
                            sx = {{
                                '& .MuiSvgIcon-root': {
                                    fontSize: 18,
                                  },
                                '& .MuiTypography-root': {
                                    fontSize: 13,
                                },
                            }}
                            disabled={shouldButtonBeDisabled()}
                        />
                        {showRatingSubmitError && (
                            <Alert
                                className=""
                                show={showRatingSubmitError}
                                onClose={() => setShowRatingSubmitError(false)}
                                dismissible
                                variant="danger"
                            >
                                {error?.message ??
                                    "An error occurred while submitting your rating"}
                            </Alert>
                        )}
                        {!userHasRated && (
                            <Button className="mr-2 mt-2 mb-3"
                                variant="primary"
                                onClick={submitHandler}
                                disabled={shouldButtonBeDisabled()}
                                size="sm"
                            >
                                {buttonTextOutput()}
                            </Button>
                        )}
                    </RadioGroup>
                </FormControl>
            </Row>
        </Container>
    );
};

const FeedbackRatingScaleInput = ({
    proposalId,
    feedbackId,
    userHasRated,
    userSubmittedRating,
}: FeedbackRatingInputProps) => {
    const { token, user } = useContext(UserProfileContext);
    const [ratingValue, setRatingValue] = useState<number>(
        userSubmittedRating ?? 0
    );

    // =================== SUBMITTING RATING MUTATION ==========================
    const {
        submitRatingMutation,
        isLoading,
        isError,
        error,
        isSuccess,
    } = useCreateFeedbackRatingMutation(
        parseInt(feedbackId),
        parseInt(proposalId),
        token,
        user
    );

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
    }

    const tokenExists = (): boolean => {
        return token != null;
    };

    const shouldButtonBeDisabled = (): boolean => {
        let flag = true;
        if (tokenExists()) flag = false;
        if (isLoading) flag = true;
        if (userHasRated) flag = true;
        return flag;
    };

    const buttonTextOutput = (): string => {
        let buttonText = "Please login to submit rating";
        if (tokenExists()) buttonText = "Submit";
        if (isLoading) buttonText = "Submitting...";
        if (userHasRated) buttonText = "You have already rated this feedback";
        return buttonText;
    };

    return (
        <Container>
            <Row>
                <FormControl
                    component="fieldset"
                    style={{ width: "100%", padding: "0rem 0rem 0rem 0rem" }}>
                    <RadioGroup
                        row
                        aria-label="rating"
                        name="rating"
                        value={ratingValue}
                        onChange={(e) => setRatingValue(parseInt(e.target.value))}
                        sx={{ width: "70%", height: "70%" }}
                    >
                        <FormControlLabel
                            value={1}
                            control={<Radio color="success" />}
                            label="1"
                            sx = {{
                                '& .MuiSvgIcon-root': {
                                    fontSize: 18,
                                  },
                                '& .MuiTypography-root': {
                                    fontSize: 13,
                                },
                            }}
                            disabled={shouldButtonBeDisabled()}
                        />
                        <FormControlLabel
                            value={2}
                            control={<Radio color="success" />}
                            label="2"
                            sx = {{
                                '& .MuiSvgIcon-root': {
                                    fontSize: 18,
                                  },
                                '& .MuiTypography-root': {
                                    fontSize: 13,
                                },
                            }}
                            disabled={shouldButtonBeDisabled()}
                        />
                        <FormControlLabel
                            value={3}
                            control={<Radio color="success" />}
                            label="3"
                            sx = {{
                                '& .MuiSvgIcon-root': {
                                    fontSize: 18,
                                  },
                                '& .MuiTypography-root': {
                                    fontSize: 13,
                                },
                            }}
                            disabled={shouldButtonBeDisabled()}
                        />
                        <FormControlLabel
                            value={4}
                            control={<Radio color="success" />}
                            label="4"
                            sx = {{
                                '& .MuiSvgIcon-root': {
                                    fontSize: 18,
                                  },
                                '& .MuiTypography-root': {
                                    fontSize: 13,
                                },
                            }}
                            disabled={shouldButtonBeDisabled()}
                        />
                        <FormControlLabel
                            value={5}
                            control={<Radio color="success" />}
                            label="5"
                            sx = {{
                                '& .MuiSvgIcon-root': {
                                    fontSize: 18,
                                  },
                                '& .MuiTypography-root': {
                                    fontSize: 13,
                                },
                            }}
                            disabled={shouldButtonBeDisabled()}
                        />
                        {showRatingSubmitError && (
                            <Alert
                                className=""
                                show={showRatingSubmitError}
                                onClose={() => setShowRatingSubmitError(false)}
                                dismissible
                                variant="danger"
                            >
                                {error?.message ??
                                    "An error occurred while submitting your rating"}
                            </Alert>
                        )}
                        {!userHasRated && (
                            <Button className="mr-2 mt-2 mb-3"
                                variant="primary"
                                onClick={submitHandler}
                                disabled={shouldButtonBeDisabled()}
                                size="sm"
                            >
                                {buttonTextOutput()}
                            </Button>
                        )}
                    </RadioGroup>
                </FormControl>
            </Row>
        </Container>
    )
}

export { FeedbackRatingScaleInput, FeedbackRatingYesNoInput };