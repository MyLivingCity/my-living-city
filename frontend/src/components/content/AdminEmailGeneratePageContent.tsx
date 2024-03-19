import { useLocation } from 'react-router-dom';
import '../../scss/content/_AdminEmailGenerate.scss';

export default function AdminEmailGeneratePageContent() {
  const location = useLocation();
  const adminmodEmail = (location.state as { adminmodEmail: string })
    .adminmodEmail;

  return (
    <div className="text-center mt-5">
      <h3>Account successfully created!</h3>
      <p className="email-text">
        Please use this email: <b>{adminmodEmail}</b> to login instead of your
        contact email
      </p>
    </div>
  );
}
