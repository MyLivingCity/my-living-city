import { Formik, type FormikConfig } from "formik";
import { type ReactNode } from "react";
import type { IRegisterInput } from "./types/register.types";

interface FormikStepperProps extends FormikConfig<
  IRegisterInput & { communityType: string }
> {
  children: ReactNode;
  step: number;
  setStep: (step: number) => void;
  submitError: string;
}

function FormikStepper({ children, ...props }: FormikStepperProps) {
  return (
    <Formik {...props}>
      <>{children}</>
    </Formik>
  );
}

export default FormikStepper;
