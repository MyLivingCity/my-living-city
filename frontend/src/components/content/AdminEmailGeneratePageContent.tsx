import React from 'react';
import { useHistory } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

export default function AdminEmailGeneratePageContent() {
    const history = useHistory();
    const location = useLocation();
    const adminmodEmail = (location.state as { adminmodEmail: string })
        .adminmodEmail;
    const handleLoginClick = () => {
        history.push('/login');
    };

    return (
        <div>
            <p>
        You have successfully created an account, Please use this email:{' '}
                {adminmodEmail} to login instead of your contact email
            </p>
            <button onClick={handleLoginClick}>Login</button>
        </div>
    );
};