/* eslint-disable */

import { Field, FieldHookConfig, FieldInputProps } from 'formik';
import { Form as BForm } from 'react-bootstrap';
import { TEXT_INPUT_LIMIT } from 'src/lib/constants';

type Props = FieldHookConfig<string> & {
    field: FieldInputProps<string>;
};

function businessCommunityRegistration(): JSX.Element {
    return (
      <>
        <BForm.Group>
          <BForm.Label>Organization Name</BForm.Label>
          <Field
            required
            name="organizationName"
            type="text"
            as={BForm.Control}
          />
        </BForm.Group>
        <BForm.Group>
          <BForm.Label>Contact First Name</BForm.Label>
          <Field required name="fname ">
            {({ field }: Props) => (
              <BForm.Control
                {...field}
                type="text"
                maxLength={TEXT_INPUT_LIMIT.NAME}
              />
            )}
          </Field>
        </BForm.Group>
        <BForm.Group>
          <BForm.Label>Contact Last Name</BForm.Label>
          <Field required name="lname">
            {({ field }: Props) => (
              <BForm.Control
                {...field}
                type="text"
                maxLength={TEXT_INPUT_LIMIT.NAME}
              />
            )}
          </Field>
        </BForm.Group>
      </>
    );
  }

  export default businessCommunityRegistration;