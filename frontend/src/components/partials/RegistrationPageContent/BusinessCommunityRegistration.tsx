/* eslint-disable */

import { Field, FieldHookConfig, FieldInputProps, Formik, useFormikContext } from 'formik';
import { Form as BForm } from 'react-bootstrap';
import { TEXT_INPUT_LIMIT } from 'src/lib/constants';

type Props = FieldHookConfig<string> & {
    field: FieldInputProps<string>;
};

function businessCommunityRegistration(setBusinessWorkDetails: any): JSX.Element {
  const {setFieldValue} = useFormikContext<any>();
    return (
      <>
        <BForm.Group>
          <BForm.Label>Organization Name</BForm.Label>
          <Field
            required
            name="organizationName"
            type="text"
            as={BForm.Control}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setBusinessWorkDetails((prev: any) => ({
                ...prev,
                organizationName: e.target.value,
              }));
              setFieldValue('organizationName', e.target.value);
            }}
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