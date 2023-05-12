import React from 'react';
import Alert from 'react-bootstrap/Alert';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <Alert variant="danger">
      <strong>Error:</strong> {message}
    </Alert>
  );
};

export default ErrorMessage;
