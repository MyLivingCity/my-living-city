/* eslint-disable */

import { Formik, FormikConfig } from "formik";
import { IRegisterInput } from "src/lib/types/input/register.input";

interface FormikStepperProps extends FormikConfig<IRegisterInput> {
    initialValues: IRegisterInput;
    markers: any;
    setSegment: any;
    setSegment2: any;
    setSubSegments: any;
    setSubSegments2: any;
    showMap: any;
    setSubIds: any;
    setSegIds: any;
    segIds: any;
    subIds: any;
    segments: any;
    refactorStateArray: any;
    setShowModal: any;
    showModal: any;
    segmentRequests: any;
    setSegmentRequests: any;
    workTransfer: boolean;
    schoolTransfer: boolean;
    avatar: any;
    userType: any;
    setUserType: any;
    reachSegmentIds: any;
    communityType: string | null;
    step: any;
    setStep: any;
    setAvatar: any;
    reachData: any;
    setSegments: any;
    subSegments: any;
    subSegments2: any;
    selectedSegId: any;
    setselectedSegId: any;
    setCommunityType: React.Dispatch<React.SetStateAction<string | null>>;
    setSegData: (index: number) => Promise<void>;
    setSubsegData: (segmentId: number) => Promise<void>;
    submitError: any;
  }

function FormikStepper({
    children,
    ...props
  }: FormikStepperProps) {
    return (
      <>
        <Formik {...props}>
          <>
            {children}
          </>
        </Formik>
      </>
    );
  }

  export default FormikStepper;