import { useEffect, useRef, useState } from "react";
import { ROUTES, USER_TYPES } from "@/lib/constants/constants";
import { Form } from "formik";
import { FormikStep } from "@components/ui/session/FormikStep";
import * as Yup from "yup";
import { Alert, Form as BForm, Card } from "react-bootstrap";
import { CheckboxTree } from "@components/ui/session/CheckboxTree";
import type { CheckBoxItem } from "@/lib/types/segment.types";
import FormikStepper from "./FormikStepper";
import RegistrationNavButtons from "./RegistrationNavButtons";
import RegisterHeader from "@components/ui/session/RegisterHeader";
import PricingPlanSelector from "@components/ui/session/PricingPlanSelector";
import CommunityLocation from "./CommunityLocation";
import "@/styles/ui/_other.scss";
import EmailPasswordForm from "./EmailPasswordForm";
import { getUserWithEmail, postRegisterUser } from "@lib/api/user.routes";
import { type ISegment } from "@/lib/types/segment.types";
import { getAllSegmentsWithSuperSegId } from "@lib/api/segment.routes";
import {
  type IRegisterInput,
  type SegmentRequest,
} from "./types/register.types";

function RegistrationPageContent() {
  const [userType, setUserType] = useState<string>(USER_TYPES.RESIDENTIAL);
  const [step, setStep] = useState<number>(1);
  const [submitError, setSubmitError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [segment, setSegment] = useState<ISegment | null>(null);
  const [segments, setSegments] = useState<ISegment[]>([]);
  const [subIds, setSubIds] = useState<number[]>([]);
  const [segIds, setSegIds] = useState<number[]>([]);
  const [segmentRequests, setSegmentRequests] = useState<SegmentRequest[]>([]);
  const [communityType, setCommunityType] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<File | undefined>(undefined);
  const [selectedSegId, setselectedSegId] = useState<number[]>([]);
  const [reachData, setReachData] = useState<CheckBoxItem[]>([]);

  const hasFetchedReachData = useRef(false);
  useEffect(() => {
    const getReachData = async () => {
      const data: CheckBoxItem[] = [];
      const region: CheckBoxItem = {
        label: segment?.parentSegment?.name,
        value: "SuperSeg",
        children: [],
      };
      const res = await getAllSegmentsWithSuperSegId(
        segment?.parentSegment?.segId,
      );
      res.forEach((segment: ISegment) => {
        region.children?.push({
          label: segment?.name,
          value: segment?.segId,
        });
      });
      data.push(region);
      setReachData(data);
    };

    if (
      step === 4 &&
      (userType === USER_TYPES.BUSINESS || userType === USER_TYPES.COMMUNITY) &&
      !hasFetchedReachData.current
    ) {
      (async () => {
        await getReachData();
        hasFetchedReachData.current = true;
      })();
    }
  }, [segment, step, userType]);

  const [businessWorkDetails, setBusinessWorkDetails] = useState({
    streetAddress: "",
    postalCode: "",
    organizationName: "",
  });

  return (
    <div className="register-page-content">
      <Card>
        <Card.Header>
          <RegisterHeader step={step} userType={userType} />
        </Card.Header>
        <Card.Body>
          <FormikStepper
            initialValues={
              {
                email: "",
                password: "",
                confirmPassword: "",
                organizationName: "",
                fname: "",
                lname: "",
                address: {
                  streetAddress: "",
                  streetAddress2: "",
                  city: "",
                  postalCode: "",
                  country: "",
                },
                geo: {
                  lon: null,
                  lat: null,
                  work_lat: null,
                  work_lon: null,
                  school_lat: null,
                  school_lon: null,
                },
                workDetails: {
                  streetAddress: "",
                  postalCode: "",
                  company: "",
                },
                schoolDetails: {
                  streetAddress: "",
                  postalCode: "",
                  faculty: "",
                  programCompletionDate: null,
                },
                homeSegmentId: null,
                workSegmentId: null,
                schoolSegmentId: null,
                homeSubSegmentId: null,
                workSubSegmentId: null,
                schoolSubSegmentId: null,
                userType: USER_TYPES.RESIDENTIAL,
                reachSegmentIds: [],
                communityType: "",
              } as IRegisterInput & { communityType: string }
            }
            step={step}
            setStep={setStep}
            submitError={submitError}
            onSubmit={async (
              values: IRegisterInput & { communityType: string },
            ) => {
              try {
                setSubmitError("");
                await postRegisterUser(values, segmentRequests, true, avatar);
                if (userType === USER_TYPES.RESIDENTIAL) {
                  localStorage.clear();
                  window.location.href = ROUTES.CHECKEMAIL;
                } else if (
                  userType === USER_TYPES.BUSINESS ||
                  userType === USER_TYPES.COMMUNITY
                ) {
                  setStep(7);
                }
              } catch (error) {
                setSubmitError(
                  "An error occurred while creating your account.",
                );
                console.error(error);
                localStorage.clear();
              }
            }}
            validationSchema={
              step === 2
                ? Yup.object().shape({
                    email: Yup.string()
                      .email("Invalid email")
                      .required("Email is required")
                      .test(
                        "Unique Email",
                        "Email already in use",
                        function (value: string) {
                          return new Promise((resolve) => {
                            getUserWithEmail(value).then((res: number) => {
                              resolve(res === 200 ? false : true);
                            });
                          });
                        },
                      ),
                    password: Yup.string()
                      .min(8, "Password is too short, 8 characters minimum")
                      .required("Password is required"),
                    confirmPassword: Yup.string()
                      .oneOf([Yup.ref("password")], "Passwords must match")
                      .required("Confirm Password is required"),
                  })
                : step === 3
                  ? Yup.object().shape({
                      homeSegmentId: Yup.number()
                        .typeError("Please select a municipality")
                        .required("Please select a municipality"),
                      communityType: Yup.string().required(
                        "Please select a community relationship",
                      ),
                    })
                  : undefined
            }
          >
            <>
              {step === 1 && (
                <FormikStep>
                  <h3>Please select your account type:</h3>
                  <BForm.Group className="m-4">
                    <PricingPlanSelector
                      onClickParam={(type: string) => {
                        setUserType(type);
                      }}
                    />
                  </BForm.Group>
                </FormikStep>
              )}
              {step === 2 && (
                <EmailPasswordForm
                  userType={userType}
                  setAvatar={setAvatar}
                  setBusinessWorkDetails={setBusinessWorkDetails}
                  businessWorkDetails={businessWorkDetails}
                />
              )}
              {step === 3 && (
                <CommunityLocation
                  segments={segments}
                  setSegment={setSegment}
                  segIds={segIds}
                  setSegIds={setSegIds}
                  communityType={communityType}
                  setCommunityType={setCommunityType}
                  subIds={subIds}
                  setSubIds={setSubIds}
                  setShowModal={setShowModal}
                  showModal={showModal}
                  setSegments={setSegments}
                  segmentRequests={segmentRequests}
                  setSegmentRequests={setSegmentRequests}
                  showNext={
                    userType !== USER_TYPES.BUSINESS &&
                    userType !== USER_TYPES.COMMUNITY
                  }
                  userType={userType}
                  businessWorkDetails={businessWorkDetails}
                />
              )}
              {((step === 4 && userType === USER_TYPES.RESIDENTIAL) ||
                (step === 5 &&
                  (userType === USER_TYPES.BUSINESS ||
                    userType === USER_TYPES.COMMUNITY))) && (
                <FormikStep>
                  <>
                    <p>
                      It takes a lot to bring an idea to form, and as a user on
                      the MLC Community Discussion Platform the following
                      agreements will enable the interactions that turn ideas
                      into reality:
                    </p>
                    <p>
                      <strong>
                        1. Ideas, comments and people are treated with respect;
                      </strong>
                    </p>
                    <p>
                      <strong>
                        2. Commenting on an idea is designed to flesh it out in
                        more detail to get as much constructive feedback and
                        viewpoints from the community.
                      </strong>
                    </p>
                    <p> The following works when commenting:</p>
                    <p className="ml-4">
                      a. Emphasize what you see that works about the idea and
                      what is the value that it brings;
                    </p>
                    <p className="ml-4">
                      b. Identify areas that don’t work and suggest how they can
                      be improved;
                    </p>
                    <p className="ml-4">
                      c. Opinions and judgments don’t add value to the
                      conversation; and
                    </p>
                    <p className="ml-4">
                      d. Share about where else this idea can go or what new
                      angle can be added to make it even better for the whole
                      community.
                    </p>
                    <p>
                      <strong>
                        3. Your ideas and experience is valuable and we want to
                        hear from everyone how to make this an actual project
                        that works in the community.
                      </strong>
                    </p>
                    <p>By clicking next you confirm:</p>
                    <p className="ml-4">
                      a. Your acceptance to follow these community guidelines;
                    </p>
                    <p className="ml-4">
                      b. That MyLivingCity has the right to store and process
                      your personal information shared with the platform.
                    </p>
                  </>
                </FormikStep>
              )}
              {step === 4 &&
                (userType === USER_TYPES.BUSINESS ||
                  userType === USER_TYPES.COMMUNITY) && (
                  <div>
                    <h3>Please select your advertisement targeted users:</h3>
                    <CheckboxTree
                      data={reachData}
                      parent={null}
                      selected={selectedSegId}
                      setSelected={setselectedSegId}
                    />
                  </div>
                )}
              {((step === 6 &&
                (userType === USER_TYPES.BUSINESS ||
                  userType === USER_TYPES.COMMUNITY)) ||
                (step === 5 && userType === USER_TYPES.RESIDENTIAL)) && (
                <FormikStep>
                  {submitError && <Alert variant="danger">{submitError}</Alert>}
                  <h3>
                    To complete registration press submit! Make sure to check
                    your email for a verification code!
                  </h3>
                </FormikStep>
              )}
              {step === 7 &&
                (userType === USER_TYPES.BUSINESS ||
                  userType === USER_TYPES.COMMUNITY) && (
                  <FormikStep>
                    <BForm.Group>
                      <h4>Would you like to setup Complementary Ad now?</h4>
                      <p>
                        You would be able to create ad later at the ad manager
                      </p>
                      <BForm.Check
                        inline
                        name="createAdRadio"
                        label="Yes"
                        type="radio"
                        onClick={() => {
                          window.location.href = ROUTES.SUBMIT_ADVERTISEMENT;
                        }}
                      />
                      <BForm.Check
                        inline
                        name="createAdRadio"
                        label="No"
                        type="radio"
                        onClick={() => {
                          window.location.href = ROUTES.LOGIN;
                        }}
                      />
                    </BForm.Group>
                  </FormikStep>
                )}
              <Form>
                <RegistrationNavButtons
                  userType={userType}
                  setStep={setStep}
                  step={step}
                />
              </Form>
            </>
          </FormikStepper>
        </Card.Body>
      </Card>
    </div>
  );
}

export default RegistrationPageContent;
