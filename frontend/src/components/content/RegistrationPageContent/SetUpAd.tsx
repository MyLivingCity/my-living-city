/* eslint-disable */

import {Form as BForm} from 'react-bootstrap';
import { FormikStep } from '../RegisterPageContent4';
import { ROUTES } from 'src/lib/constants';

function SetUpAd() {
  return (
    <FormikStep>
      <BForm.Group>
        <h4>Would you like to setup Complementary Ad now?</h4>
        <p>You would be able to create ad later at the ad manager</p>
        <BForm.Check
          inline
          name="createAdRadio"
          label="Yes"
          type="radio"
          id="inline-checkbox"
          onClick={() => {
            window.location.href = ROUTES.SUBMIT_ADVERTISEMENT;
          }}
        />
        <BForm.Check
          inline
          name="createAdRadio"
          label="No"
          type="radio"
          id="inline-checkbox"
          onClick={() => {
            window.location.href = ROUTES.LOGIN;
          }}
        />
      </BForm.Group>
    </FormikStep>
  );
}

export default SetUpAd;