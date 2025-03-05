/* eslint-disable */

import { Alert } from 'react-bootstrap';
import { FormikStep } from '../RegisterPageContent4';


function SubmitForm({ submitError }: { submitError: any }) {
    return (
      <FormikStep>
        {submitError && <Alert variant="danger">{submitError}</Alert>}
        <h3>
          To complete registration press submit! Make sure to check your email
          for a verification code!
        </h3>
      </FormikStep>
    );
  }

  export default SubmitForm;