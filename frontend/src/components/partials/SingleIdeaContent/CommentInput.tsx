import { useFormik } from 'formik';
import { useContext, useEffect } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { useParams } from 'react-router';
import { UserProfileContext } from '../../../contexts/UserProfile.Context';
import { useCreateCommentMutation } from '../../../hooks/commentHooks';

interface CommentInputProps {

}

const CommentInput = (props: CommentInputProps) => {
  const { token, user } = useContext(UserProfileContext);
  const { ideaId } = useParams<{ ideaId: string }>();

  const {
    submitComment,
    isLoading,
    isError,
    isSuccess,
    error
  } = useCreateCommentMutation(parseInt(ideaId), token, user);

  const submitHandler = (values: { content: string }) => {
    submitComment(values);
    formik.resetForm();
  }

  const formik = useFormik<{ content: string }>({
    initialValues: {
      content: ''
    },
    onSubmit: submitHandler,
  })

  // Helper Functions
  const tokenExists = (): boolean => {
    return token != null;
  }

  const shouldButtonBeDisabled = (): boolean => {
    // Unauthenticated
    let flag = true;
    if (tokenExists()) flag = false;
    if (isLoading) flag = true;
    return flag;
  }

  const buttonTextOutput = (): string => {
    // Unauthenticated
    let buttonText = 'Please login to comment';
    if (tokenExists()) buttonText = 'Share';
    if (isLoading) buttonText = 'Saving Comment';
    return buttonText;
  }

  useEffect(() => {
    console.log(isLoading, isError, isSuccess);
  }, [isLoading, isError, isSuccess])

  return (
    <Container>
      <Row>
        <Col>
          <Form onSubmit={formik.handleSubmit}>
            {tokenExists() && (
              <Form.Control
                name='content'
                as='textarea'
                rows={3}
                placeholder='Write your comment here!'
                onChange={formik.handleChange}
                value={formik.values.content}
              />
            )}
            <Button
              block
              type='submit'
              disabled={shouldButtonBeDisabled()}
            >
              {buttonTextOutput()}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default CommentInput