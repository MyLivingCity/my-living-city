/* eslint-disable */

import { useFormikContext } from "formik";
import { USER_TYPES } from "src/lib/constants";
import { Form as BForm, Button} from 'react-bootstrap';

interface NextAndBackButtonProps {
    userType: string;
    setStep: (step: number) => void;
    step: number;
    isLoading?: boolean;
  }
  
function NextAndBackButton({
    userType,
    setStep,
    step,
    isLoading = false,
  }: NextAndBackButtonProps) {
    const { validateForm, setTouched } = useFormikContext<any>();
    const lastStep = userType === USER_TYPES.RESIDENTIAL ? 5 : 6;
    const isLastStep = step >= lastStep;
    const nextLabel = isLoading ? 'Loading...' : 'Next';
    const submitLabel = isLoading ? 'Submitting...' : 'Submit';
  
    const handleNext = async () => {
      const errors = await validateForm();
      if (Object.keys(errors).length === 0) {
        setStep(step + 1);
      } else {
        const touchedFields = Object.keys(errors).reduce(
          (acc, key) => ({ ...acc, [key]: true }),
          {}
        );
        setTouched(touchedFields, true);
      }
    };
  
    return (
      <BForm.Group className="d-flex justify-content-between mt-3">
        {step > 1 && (
          <Button
            type="button"
            variant="outline-primary"
            onClick={() => setStep(step - 1)}
          >
            Back
          </Button>
        )}
        {!isLastStep ? (
          <Button
            type="button"
            variant="primary"
            disabled={isLoading}
            onClick={handleNext}
          >
            {nextLabel}
          </Button>
        ) : (
          <Button type="submit" variant="success" disabled={isLoading}>
            {submitLabel}
          </Button>
        )}
      </BForm.Group>
    );
  }

  export default NextAndBackButton;