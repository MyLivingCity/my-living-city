import {  Container, Row } from 'react-bootstrap';
import { IFeedbackRatingScaleAggregateSummary,
    IFeedbackRatingYesNoAggregateSummary }
    from 'src/lib/types/data/feedbackRating.type';

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
        <Container className=''>
            <Row className=''>
                <p style={{fontSize: '80%'}}>Average Rating: {ratingAvg}</p>
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
        <Container className=''>
            <Row className=''>
                <p style={{fontSize: '80%'}}> Yes to No: {yesToNo} </p>
            </Row>
        </Container>
    );
};
export { FeedbackRatingScaleDisplay, FeedbackRatingYesNoDisplay };
