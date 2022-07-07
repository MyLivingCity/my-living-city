import React, { useContext } from 'react'
import { RouteComponentProps } from 'react-router-dom';
import { UserManagementContent } from 'src/components/content/UserManagementContent';
import { IdeaManagementContent } from 'src/components/content/IdeaManagementContent';
import { UserProfileContext } from '../contexts/UserProfile.Context';
import { useAllUsers } from 'src/hooks/userHooks';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useCategories } from '../hooks/categoryHooks';
import { CacheProvider } from '@emotion/react';
import { ProposalManagementContent } from 'src/components/content/ProposalManagementContent';
import { CommentManagementContent } from 'src/components/content/CommentManagementContent';

// Extends Route component props with idea title route param
interface ModManagementProps extends RouteComponentProps<{}> {
  // Add custom added props here 
}

const ModManagementPage: React.FC<ModManagementProps> = ({}) => {
  const { token } = useContext(UserProfileContext);
  const {user} = useContext(UserProfileContext) 

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
      <UserManagementContent users={data!} token={token} user={user}/>
      <br></br>
      <IdeaManagementContent users={data!} token={token} user={user}/>
      <br></br>
      <ProposalManagementContent users={data!} token={token} user={user}/>
      <br></br>
      <CommentManagementContent users={data!} token={token} user={user}/>

      
    </div>
  );
}

export default ModManagementPage