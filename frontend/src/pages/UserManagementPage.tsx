import React, { useContext } from 'react'
import { RouteComponentProps } from 'react-router-dom';
import { UserManagementContent } from 'src/components/content/UserManagementContent';
import { UserProfileContext } from '../contexts/UserProfile.Context';
import { useAllUsers } from 'src/hooks/userHooks';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useCategories } from '../hooks/categoryHooks';
// Extends Route component props with idea title route param
interface UserManagementProps extends RouteComponentProps<{}> {
  // Add custom added props here 
}

const UserManagementPage: React.FC<UserManagementProps> = ({}) => {
  const { token } = useContext(UserProfileContext);
  const { data, isLoading} = useAllUsers(token);
  if (isLoading) {
    return(
      <div className="wrapper">
      <LoadingSpinner />
      </div>
    )

  }

  // TODO: Create non blocking error handling

  return (
    <div className="wrapper">
      <UserManagementContent users={data!} token={token}/>
    </div>
  );
}

export default UserManagementPage