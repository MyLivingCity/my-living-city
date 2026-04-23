import { useFormikContext } from "formik";
import { USER_TYPES } from "@lib/constants";
import { Form as BForm, Button } from "react-bootstrap";

interface RegistrationNavButtonsProps {
  userType: string;
  setStep: (step: number) => void;
  step: number;
  isLoading?: boolean;
}

function RegistrationNavButtons({
  userType,
  setStep,
  step,
  isLoading = false,
}: RegistrationNavButtonsProps) {
  const { validateForm, setTouched } = useFormikContext();
  const lastStep = userType === USER_TYPES.RESIDENTIAL ? 5 : 6;
  const isLastStep = step >= lastStep;

  const handleNext = async () => {
    const errors = await validateForm();
    if (Object.keys(errors).length === 0) {
      setStep(step + 1);
    } else {
      const touchedFields = Object.keys(errors).reduce<Record<string, boolean>>(
        (acc, key) => ({ ...acc, [key]: true }),
        {},
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
          {isLoading ? "Loading..." : "Next"}
        </Button>
      ) : (
        <Button type="submit" variant="success" disabled={isLoading}>
          {isLoading ? "Submitting..." : "Submit"}
        </Button>
      )}
    </BForm.Group>
  );
}

export default RegistrationNavButtons;
