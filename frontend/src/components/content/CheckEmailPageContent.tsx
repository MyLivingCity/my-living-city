import React from "react";
import { useHistory } from "react-router-dom";

const CheckEmailPageContent = () => {
  const history = useHistory();

  const navigateToLogin = () => {
    history.push("/login");
  };

  return (
    <div className="container mt-5 text-center check-email-page">
      <h2>Registration Successful!</h2>
      <p className="my-4">
        Please check your email to complete the registration process.
      </p>
      <button className="btn btn-primary" onClick={navigateToLogin}>
        Go to Login
      </button>
    </div>
  );
};

export default CheckEmailPageContent;
