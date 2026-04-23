import { USER_TYPES } from "@lib/constants";

type RegisterHeaderProps = {
  step: number;
  userType: string;
};

function RegisterHeader({ step, userType }: RegisterHeaderProps) {
  const isResidential = userType === USER_TYPES.RESIDENTIAL;

  const steps = isResidential
    ? ["Account Type", "Create Account", "Location", "Agreement", "Submit"]
    : [
        "Account Type",
        "Create Account",
        "Location",
        "Reach",
        "Agreement",
        "Submit",
      ];

  return (
    <div className="stepper mb-4 d-flex align-items-center justify-content-center">
      {steps.map((title, index) => {
        const stepNumber = index + 1;
        const isComplete = step > stepNumber;
        const isActive = step === stepNumber;

        return (
          <div key={title} className="d-flex align-items-center">
            <div className="d-flex flex-column align-items-center">
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  backgroundColor:
                    isComplete || isActive ? "#98cc74" : "#dee2e6",
                  color: isComplete || isActive ? "white" : "#6c757d",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  fontSize: 14,
                }}
              >
                {stepNumber}
              </div>
              <small
                style={{
                  fontSize: 11,
                  marginTop: 4,
                  color: isActive ? "#98cc74" : "#6c757d",
                  fontWeight: isActive ? "bold" : "normal",
                  textAlign: "center",
                  maxWidth: 70,
                }}
              >
                {title}
              </small>
            </div>
            {index < steps.length - 1 && (
              <div
                style={{
                  height: 2,
                  width: 40,
                  backgroundColor: isComplete ? "#98cc74" : "#dee2e6",
                  marginBottom: 20,
                  marginLeft: 4,
                  marginRight: 4,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default RegisterHeader;
