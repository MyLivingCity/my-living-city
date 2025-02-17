import { StepButton } from '@mui/material';
import RegisterPageContent from '../components/content/RegisterPageContent4';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import useUserRoles from '../hooks/useUserRoles';
import StepController from 'src/components/content/RegistrationPageContent/StepController';
// import { UserProfileContext } from '../contexts/UserProfile.Context';
// import { useUserWithJwtVerbose } from '../hooks/userHooks';
// import React, { useContext } from 'react'

export default function RegisterPage() {

    // Fetch User Roles
    // const { data, error, isLoading } = useUserRoles();

    // if (isLoading) {
    //   return (
    //     <div className="wrapper">
    //       <LoadingSpinner />
    //     </div>
    //   )
    // }


    return (
        <div className='wrapper'>
            <RegisterPageContent/>
        </div>
    );
}
