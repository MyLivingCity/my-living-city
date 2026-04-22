import { type ReactNode } from "react";
import type { AnyObjectSchema } from "yup";

interface FormikStepProps {
  children: ReactNode;
  validationSchema?: AnyObjectSchema;
}

export function FormikStep({ children }: FormikStepProps) {
  return <>{children}</>;
}
