import { useHistory } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Button from "react-bootstrap/Button";
import "../../scss/content/_AdminEmailGenerate.scss";

export default function AdminEmailGeneratePageContent() {
  const history = useHistory();
  const location = useLocation();
  const adminmodEmail = (location.state as { adminmodEmail: string })
    .adminmodEmail;

  const handleReturnToAdminManagement = () => {
    history.push("/admin/management");
  };

  return (
    <div className="text-center mt-5">
      {" "}
      <h3>Account successfully created!</h3>
      <p className="email-text">
        Please use this email: <b>{adminmodEmail}</b> to login instead of your
        contact email
      </p>
      {/* <Button
        variant="primary"
        className="align-button-left mb-4 mt-4"
        onClick={handleReturnToAdminManagement}
      >
        Return to Admin Management Wizard
      </Button> */}
    </div>
  );
}
