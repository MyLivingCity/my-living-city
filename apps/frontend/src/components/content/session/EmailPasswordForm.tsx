import { ErrorMessage, Field, useFormikContext } from "formik";
import { FormControl, Form as BForm } from "react-bootstrap";
import { FormikStep } from "@components/ui/session/FormikStep";
import { getUserWithEmail } from "@lib/api/user.routes";
import * as Yup from "yup";
import { USER_TYPES, TEXT_INPUT_LIMIT } from "src/lib/constants/constants";

type BusinessWorkDetails = {
  streetAddress: string;
  postalCode: string;
  organizationName: string;
};

type EmailPasswordFormProps = {
  userType: string;
  setAvatar: (avatar: File) => void;
  setBusinessWorkDetails: React.Dispatch<
    React.SetStateAction<BusinessWorkDetails>
  >;
  businessWorkDetails: BusinessWorkDetails;
};

const ResidentialFields = () => (
  <>
    <BForm.Group>
      <BForm.Label>First Name</BForm.Label>
      <Field
        name="fname"
        type="text"
        as={FormControl}
        maxLength={TEXT_INPUT_LIMIT.NAME}
      />
    </BForm.Group>
    <BForm.Group>
      <BForm.Label>Last Name</BForm.Label>
      <Field
        name="lname"
        type="text"
        as={FormControl}
        maxLength={TEXT_INPUT_LIMIT.NAME}
      />
    </BForm.Group>
  </>
);

const BusinessCommunityFields = ({
  setBusinessWorkDetails,
}: {
  setBusinessWorkDetails: React.Dispatch<
    React.SetStateAction<BusinessWorkDetails>
  >;
}) => {
  const { setFieldValue } = useFormikContext();
  return (
    <>
      <BForm.Group>
        <BForm.Label>Organization Name</BForm.Label>
        <Field
          name="organizationName"
          type="text"
          as={FormControl}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setBusinessWorkDetails((prev) => ({
              ...prev,
              organizationName: e.target.value,
            }));
            setFieldValue("organizationName", e.target.value);
          }}
        />
      </BForm.Group>
      <BForm.Group>
        <BForm.Label>Contact First Name</BForm.Label>
        <Field
          name="fname"
          type="text"
          as={FormControl}
          maxLength={TEXT_INPUT_LIMIT.NAME}
        />
      </BForm.Group>
      <BForm.Group>
        <BForm.Label>Contact Last Name</BForm.Label>
        <Field
          name="lname"
          type="text"
          as={FormControl}
          maxLength={TEXT_INPUT_LIMIT.NAME}
        />
      </BForm.Group>
    </>
  );
};

const emailPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email")
    .required("Email is required")
    .test("Unique Email", "Email already in use", async (value) => {
      if (!value) return true;

      try {
        const user = await getUserWithEmail(value);
        return !user;
      } catch (error) {
        console.log(
          "Error validating email uniqueness, assuming unique:",
          error,
        );
        return true;
      }
    }),
  password: Yup.string()
    .min(8, "Password is too short, 8 characters minimum")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
  address: Yup.object().shape({
    streetAddress: Yup.string().required("Street Name is required"),
    postalCode: Yup.string().required("ZIP / Postal Code is required"),
  }),
});

function EmailPasswordForm({
  userType,
  setAvatar,
  setBusinessWorkDetails,
}: EmailPasswordFormProps) {
  const { setFieldValue } = useFormikContext();
  const isBusinessOrCommunity =
    userType === USER_TYPES.BUSINESS || userType === USER_TYPES.COMMUNITY;

  return (
    <FormikStep validationSchema={emailPasswordSchema}>
      <BForm.Group>
        <BForm.Label>Email address</BForm.Label>
        <Field name="email" type="email" as={FormControl} />
        <ErrorMessage name="email">
          {(msg) => <p className="text-danger">{msg}</p>}
        </ErrorMessage>
      </BForm.Group>

      <BForm.Group>
        <BForm.Label>Password</BForm.Label>
        <Field name="password" type="password" as={FormControl} />
        <ErrorMessage name="password">
          {(msg) => <p className="text-danger">{msg}</p>}
        </ErrorMessage>
      </BForm.Group>

      <BForm.Group>
        <BForm.Label>Confirm Password</BForm.Label>
        <Field name="confirmPassword" type="password" as={FormControl} />
        <ErrorMessage name="confirmPassword">
          {(msg) => <p className="text-danger">{msg}</p>}
        </ErrorMessage>
      </BForm.Group>

      {isBusinessOrCommunity ? (
        <BusinessCommunityFields
          setBusinessWorkDetails={setBusinessWorkDetails}
        />
      ) : (
        <ResidentialFields />
      )}

      <BForm.Group>
        <BForm.Label>Profile Picture</BForm.Label>
        <FormControl
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) setAvatar(file);
          }}
        />
        <BForm.Text className="text-muted">
          Max file size 2MB — jpg, jpeg, png, webp
        </BForm.Text>
      </BForm.Group>

      <BForm.Group>
        <BForm.Label>Street Name</BForm.Label>
        <Field
          name="address.streetAddress"
          type="text"
          as={FormControl}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setBusinessWorkDetails((prev) => ({
              ...prev,
              streetAddress: e.target.value,
            }));
            setFieldValue("address.streetAddress", e.target.value);
          }}
        />
        <ErrorMessage name="address.streetAddress">
          {(msg) => <p className="text-danger">{msg}</p>}
        </ErrorMessage>
      </BForm.Group>

      <BForm.Group>
        <BForm.Label>ZIP / Postal Code</BForm.Label>
        <Field
          name="address.postalCode"
          type="text"
          as={FormControl}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setBusinessWorkDetails((prev) => ({
              ...prev,
              postalCode: e.target.value,
            }));
            setFieldValue("address.postalCode", e.target.value);
          }}
        />
        <ErrorMessage name="address.postalCode">
          {(msg) => <p className="text-danger">{msg}</p>}
        </ErrorMessage>
      </BForm.Group>
    </FormikStep>
  );
}

export default EmailPasswordForm;
