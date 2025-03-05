/* eslint-disable */

import { Field, FieldHookConfig, FieldInputProps } from 'formik';
import { Form as BForm } from 'react-bootstrap';
import { TEXT_INPUT_LIMIT } from 'src/lib/constants';

type Props = FieldHookConfig<string> & {
    field: FieldInputProps<string>;
};

function notBusinessNorCommunity(): JSX.Element {
    return (
      <>
        <BForm.Group>
          <BForm.Label>First Name</BForm.Label>
          <Field required name="fname">
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
          <BForm.Label>Last Name</BForm.Label>
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

  export default notBusinessNorCommunity;