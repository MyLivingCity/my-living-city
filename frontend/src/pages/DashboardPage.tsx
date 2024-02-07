import { useContext, useState } from 'react';
import { useUserWithJwtVerbose } from 'src/hooks/userHooks';
import { UserProfileContext } from 'src/contexts/UserProfile.Context';
import DashboardPageContent from '../components/content/DashboardPageContent';
import LoadingSpinner from 'src/components/ui/LoadingSpinner';

export default function Dashboard() {
    const { token } = useContext(UserProfileContext);
    // useQuery will retrigger every 10 minutes to update the user's data

    const { 
        data: userData,
        isLoading: userIsLoading,
        error: userError,
    } = useUserWithJwtVerbose({ jwtAuthToken: token!, shouldTrigger: true });

    if (userIsLoading) {
        return <LoadingSpinner />;
    }

    if (userError) {
        return <div>Error when fetching necessary data</div>;
    }

    return (
        <div className='wrapper'>
            <DashboardPageContent
                user={userData!}
                token={token!}
            />
        </div>
    );
}
