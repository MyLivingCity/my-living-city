/* eslint-disable */

import { ErrorMessage, Field, useFormikContext,} from 'formik';
import { Form as BForm} from 'react-bootstrap';
import { FormikStep } from '../../content/RegisterPageContent4';
import { getUserWithEmail } from 'src/lib/api/userRoutes';
import * as Yup from 'yup';
import businessCommunityRegistration from './BusinessCommunityRegistration';
import notBusinessNorCommunity from './NotBusinessNorCommunity';
import { USER_TYPES } from 'src/lib/constants';
import ImageUploader from 'react-images-upload';
import { useEffect } from 'react';


function EmailPasswordForm({
    userType,
    setAvatar,
    setBusinessWorkDetails,
    businessWorkDetails,
  }: {
    userType: any;
    setAvatar: any;
    setBusinessWorkDetails: any;
    businessWorkDetails: any;
  }) {
    const { setFieldValue } = useFormikContext<any>();
    return (
      <>
        <FormikStep
          validationSchema={Yup.object().shape({
            email: Yup.string()
              .email('Invalid email')
              .required('Email is required')
              .test('Unique Email', 'Email already in use', function (value) {
                return new Promise((resolve) => {
                  getUserWithEmail(value).then((res) => {
                    res === 200 ? resolve(false) : resolve(true);
                  });
                });
              }),
            password: Yup.string()
              .min(8, 'Password is too short, 8 characters minimum')
              .required('Password is required'),
            confirmPassword: Yup.string()
              .oneOf([Yup.ref('password'), null], 'Passwords must match')
              .required('Confirm Password is required'),
            address: Yup.object().shape({
              streetAddress: Yup.string().required('Street Name is required'),
              postalCode: Yup.string().required('ZIP / Postal Code is required'),
            }),
          })}
        >
          <BForm.Group>
            <BForm.Label>Email address</BForm.Label>
            <Field required name="email" type="email" as={BForm.Control} />
            <ErrorMessage name="email">
              {(msg) => (
                <p className="text-danger">
                  {msg}
                  <br />
                </p>
              )}
            </ErrorMessage>
          </BForm.Group>
          <BForm.Group>
            <BForm.Label>Password</BForm.Label>
            <Field
              required
              name="password"
              type="password"
              as={BForm.Control}
            />
            <ErrorMessage name="password">
              {(msg) => (
                <p className="text-danger">
                  {msg}
                  <br />
                </p>
              )}
            </ErrorMessage>
          </BForm.Group>
          <BForm.Group>
            <BForm.Label>Confirm Password</BForm.Label>
            <Field
              required
              name="confirmPassword"
              type="password"
              as={BForm.Control}
            />
            <ErrorMessage name="confirmPassword">
              {(msg) => (
                <p className="text-danger">
                  {msg}
                  <br />
                </p>
              )}
            </ErrorMessage>
          </BForm.Group>
  
          {userType === USER_TYPES.BUSINESS ||
          userType === USER_TYPES.COMMUNITY
            ? businessCommunityRegistration(setBusinessWorkDetails)
            : notBusinessNorCommunity()}
  
          <BForm.Group>
            <Field
              name="imagePath"
              type="file"
              fileContainerStyle={{ backgroundColor: '#F8F9FA' }}
              withPreview={true}
              onChange={(pic: any) => setAvatar(pic[0])}
              imgExtension={['.jpg', '.jpeg', '.png', '.webp']}
              buttonText="Select Profile Picture"
              maxFileSize={2097152}
              label={'Max file size 2mb, \n jpg, jpeg, png, webp'}
              singleImage={true}
              as={ImageUploader}
            />
          </BForm.Group>
          <BForm.Group>
          <BForm.Label>Street Name</BForm.Label>
          <Field
            name="address.streetAddress"
            type="text"
            as={BForm.Control}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setBusinessWorkDetails((prev: any) => ({
                ...prev,
                streetAddress: e.target.value,
              }));
              setFieldValue("address.streetAddress", e.target.value);
            }}
          />
          <ErrorMessage name="address.streetAddress">
            {(msg) => (
              <p className="text-danger">
                {msg}
                <br />
              </p>
            )}
          </ErrorMessage>
        </BForm.Group>
        <BForm.Group>
          <BForm.Label>ZIP / Postal Code</BForm.Label>
          <Field name="address.postalCode" type="text" as={BForm.Control} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setBusinessWorkDetails((prev: any) => ({
                ...prev,
                postalCode: e.target.value,
              }));
              setFieldValue("address.postalCode", e.target.value);
            }} />
          <ErrorMessage name="address.postalCode">
            {(msg) => (
              <p className="text-danger">
                {msg}
                <br />
              </p>
            )}
          </ErrorMessage>
        </BForm.Group>
        </FormikStep>
      </>
    );
  }

  export default EmailPasswordForm;

function setFieldValue(arg0: string, streetAddress: any) {
  throw new Error('Function not implemented.');
}
