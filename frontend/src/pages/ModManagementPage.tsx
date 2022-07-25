import React, { useContext, useState } from 'react'
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
import { useIdeasWithBreakdown } from 'src/hooks/ideaHooks';
import { useProposalsWithBreakdown } from 'src/hooks/proposalHooks';
import { useAllCommentFlags, useAllFlags } from 'src/hooks/flagHooks';
import { useThreshold } from 'src/hooks/threshholdHooks';
import { IIdea, IIdeaWithAggregations } from 'src/lib/types/data/idea.type';
import { useAllComments } from 'src/hooks/commentHooks';
import { IUser } from 'src/lib/types/data/user.type';
import { IComment } from 'src/lib/types/data/comment.type';
import { IProposalWithAggregations } from 'src/lib/types/data/proposal.type';
import { Button } from 'react-bootstrap';
import { checkIfUserHasRated } from 'src/lib/utilityFunctions';
import UserFlagsModal from 'src/components/partials/SingleIdeaContent/UserFlagsModal';
import { updateLanguageServiceSourceFile } from 'typescript';
import { updateThreshhold } from 'src/lib/api/threshholdRoutes';

// Extends Route component props with idea title route param
interface ModManagementProps extends RouteComponentProps<{}> {
  // Add custom added props here 
}

const ModManagementPage: React.FC<ModManagementProps> = ({}) => {
  const { token } = useContext(UserProfileContext);
  const {user} = useContext(UserProfileContext) 

  const { data: userData, isLoading: userLoading} = useAllUsers(token);
  const { data: ideaData, isLoading: ideaLoading} = useIdeasWithBreakdown(20);
  const { data: proposalData, isLoading: proposalLoading} = useProposalsWithBreakdown(20);
  const { data: commentData, isLoading: commentLoading} = useAllComments();
  const { data: flagData, isLoading: flagLoading} = useAllFlags(token);
  const {data: commentFlagData, isLoading: commentFlagLoading} = useAllCommentFlags(token);
  const {data: threshholdData, isLoading: threshholdLoading} = useThreshold(token);
  const [pageState, setPageState] = useState<String>("quarantine");

  let threshhold: number = 3;
  const [newThreshold, setNewThreshhold] = useState(threshhold);

  let propIdeaData: IIdeaWithAggregations[] = []
  let quarantineIdea : IIdeaWithAggregations[] = [];
  let quarantineComment : IComment[] = [];
  let quarantineProposal : IProposalWithAggregations[] = [];
  let quarantineUser : IUser[] = [];
  let flaggedUser: number[] = [];
  function loadState(state: String){
    setPageState(state);
  }
  if (userLoading || ideaLoading || proposalLoading || commentLoading || flagLoading || commentFlagLoading || threshholdLoading) {
    return(
      <div className="wrapper">
      <LoadingSpinner />
      </div>
    )
  }
  
  if(ideaData){
    propIdeaData = ideaData;
  }
  if(threshholdData){
    if(threshholdData.number){
      threshhold = threshholdData.number;
    }
  }
  function changeThresholdData(val: any){
    let num = parseInt(val.target.value);
    if(!isNaN(num)){
      setNewThreshhold(num);
    }
  }
  function metThreshholdUser(user: IUser){
    let counter: number = 0;
    for(let i = 0; i < flagData!.length; i++){
      if(flagData![i].flaggerId === user.id && flagData![i].falseFlag === true){
        counter = counter + 1;
      }
    }
    for(let i = 0; i < commentFlagData!.length; i++){
      if(commentFlagData![i].flaggerId === user.id && commentFlagData![i].falseFlag === true){
        counter = counter + 1;
      }
    }
    if(counter >= threshhold){
      return true;
    }else{
      return false;
    }
  }
  function metThreshholdIdea(idea: IIdeaWithAggregations){
    let counter: number = 0;
    for(let i = 0; i < flagData!.length; i++){
      if(flagData![i].ideaId === idea.id && flagData![i].falseFlag === false){
        counter = counter + 1;
      }
    }
    if(counter >= threshhold){
      return true;
    }else{
      return false;
    }
  }
  function metThreshholdProposal(proposal: IProposalWithAggregations){
    let counter: number = 0;
    for(let i = 0; i < flagData!.length; i++){
      if(flagData![i].ideaId === proposal.idea.id && flagData![i].falseFlag === false){
        counter = counter + 1;
      }
    }
    if(counter >= threshhold){
      return true;
    }else{
      return false;
    }
  }
  function metThresholdComment(comment: IComment){
    let counter: number = 0;
    for(let i = 0; i < commentFlagData!.length; i++){
      if(commentFlagData![i].commentId === comment.id && commentFlagData![i].falseFlag === false){
        counter = counter + 1;
      }
    }
    if(counter >= threshhold){
      return true;
    }else{
      return false;
    }
  }

  if(ideaData && userData && proposalData && commentData && flagData){
      quarantineIdea = ideaData.filter((idea, index) => (idea.reviewed === false && idea.active === false) || (metThreshholdIdea(idea) && idea.reviewed === false));
      quarantineComment = commentData.filter((comment, index) => (comment.reviewed === false && comment.active === false) || (metThresholdComment(comment) && comment.reviewed === false));
      quarantineProposal = proposalData.filter((proposal, index) => (proposal.idea.reviewed === false && proposal.idea.active === false) || (metThreshholdProposal(proposal) && proposal.idea.reviewed === false));
      quarantineUser = userData.filter((user, index) => (user.reviewed === false && user.banned === true) || (metThreshholdUser(user) && user.reviewed === false));
  }


  // TODO: Create non blocking error handling
  if(pageState === "quarantine"){
    return (
      <div>
        <div style={{width: 200, float:'left', height:240, marginLeft:'12%'}}>
          <Button style={{border: 'none', width: 200, textAlign: 'left', height: 40}}  onClick={() => {window.scrollTo({top: 0, left: 0, behavior: 'smooth'});}}>Dashboard</Button>
          <br></br>
          <Button style={{border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black'}} onClick={() => loadState("quarantine")}>Quarantine List</Button>
          <br></br>
          <Button style={{border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black'}} onClick={() => loadState("user")}>User View</Button>
          <br></br>
          <Button style={{border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black'}} onClick={() => loadState("idea")}>Idea View</Button>
          <br></br>
          <Button style={{border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black'}} onClick={() => loadState("proposal")}>Proposal View</Button>
          <br></br>
          <Button style={{border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black'}} onClick={() => loadState("comment")}>Comment View</Button>
        </div>
      <div style={{width: '80%', marginLeft:'22%'}}>
      <div style={{ float: 'right', marginRight:'22%'}}>
          <p style={{textAlign: 'left'}} className='ml-10 mr-2 display-6'>Current Threshhold: {threshhold.toString()}</p>
          <input type="number" onChange={(val) => changeThresholdData(val)} style={{textAlign: 'left', right: "0"}} className='ml-10 mr-2 display-6'/>
          <Button onClick={() => updateThreshhold(newThreshold, token!)}>Update Threshhold</Button>
      </div>
        <br></br>
        <UserManagementContent users={quarantineUser!} token={token} user={user} flags={flagData} commentFlags={commentFlagData} ideas={ideaData} proposals={proposalData} comments={commentData}/>
        <br></br>
        <IdeaManagementContent users={userData!} token={token} user={user} ideas={quarantineIdea!} flags={flagData}/>
        <br></br>
        <ProposalManagementContent users={userData!} token={token} user={user} proposals={quarantineProposal!} ideas={quarantineIdea!} flags={flagData}/>
        <br></br>
        <CommentManagementContent users={userData!} token={token} user={user} comments={quarantineComment} ideas={ideaData!} commentFlags={commentFlagData}/>
      </div>
    </div>
    );
  }
  if(pageState ==="user"){
    return (
      <div>
      <div style={{width: 200, float:'left', height:240, marginLeft:'12%'}}>
        <Button style={{border: 'none', width: 200, textAlign: 'left', height: 40}}  onClick={() => {window.scrollTo({top: 0, left: 0, behavior: 'smooth'});}}>Dashboard</Button>
        <br></br>
        <Button style={{border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black'}} onClick={() => loadState("quarantine")}>Quarantine List</Button>
        <br></br>
        <Button style={{border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black'}} onClick={() => loadState("user")}>User View</Button>
        <br></br>
        <Button style={{border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black'}} onClick={() => loadState("idea")}>Idea View</Button>
        <br></br>
        <Button style={{border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black'}} onClick={() => loadState("proposal")}>Proposal View</Button>
        <br></br>
        <Button style={{border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black'}} onClick={() => loadState("comment")}>Comment View</Button>
      </div>
    <div style={{width: '80%', marginLeft:'22%'}}>
      <UserManagementContent users={userData!} token={token} user={user} flags={flagData} commentFlags={commentFlagData} ideas={ideaData} proposals={proposalData} comments={commentData}/>
      </div>
    </div>
    );
  }
  if(pageState ==="idea"){
    return (
      <div>
      <div style={{width: 200, float:'left', height:240, marginLeft:'12%'}}>
        <Button style={{border: 'none', width: 200, textAlign: 'left', height: 40}}  onClick={() => {window.scrollTo({top: 0, left: 0, behavior: 'smooth'});}}>Dashboard</Button>
        <br></br>
        <Button style={{border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black'}} onClick={() => loadState("quarantine")}>Quarantine List</Button>
        <br></br>
        <Button style={{border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black'}} onClick={() => loadState("user")}>User View</Button>
        <br></br>
        <Button style={{border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black'}} onClick={() => loadState("idea")}>Idea View</Button>
        <br></br>
        <Button style={{border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black'}} onClick={() => loadState("proposal")}>Proposal View</Button>
        <br></br>
        <Button style={{border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black'}} onClick={() => loadState("comment")}>Comment View</Button>
      </div>
      <div style={{width: '80%', marginLeft:'22%'}}>
        <IdeaManagementContent users={userData!} token={token} user={user} ideas={ideaData!} flags={flagData}/>
      </div>
      </div>
    );
  }
  if(pageState ==="proposal"){
    return (
      <div>
      <div style={{width: 200, float:'left', height:240, marginLeft:'12%'}}>
        <Button style={{border: 'none', width: 200, textAlign: 'left', height: 40}}  onClick={() => {window.scrollTo({top: 0, left: 0, behavior: 'smooth'});}}>Dashboard</Button>
        <br></br>
        <Button style={{border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black'}} onClick={() => loadState("quarantine")}>Quarantine List</Button>
        <br></br>
        <Button style={{border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black'}} onClick={() => loadState("user")}>User View</Button>
        <br></br>
        <Button style={{border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black'}} onClick={() => loadState("idea")}>Idea View</Button>
        <br></br>
        <Button style={{border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black'}} onClick={() => loadState("proposal")}>Proposal View</Button>
        <br></br>
        <Button style={{border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black'}} onClick={() => loadState("comment")}>Comment View</Button>
      </div>
      <div style={{width: '80%', marginLeft:'22%'}}>
        <ProposalManagementContent users={userData!} token={token} user={user} proposals={proposalData!} ideas={propIdeaData!} flags={flagData}/>
      </div>
      </div>
    );
  }
  if(pageState ==="comment"){
    return (
      <div>
      <div style={{width: 200, float:'left', height:240, marginLeft:'12%'}}>
        <Button style={{border: 'none', width: 200, textAlign: 'left', height: 40}}  onClick={() => {window.scrollTo({top: 0, left: 0, behavior: 'smooth'});}}>Dashboard</Button>
        <br></br>
        <Button style={{border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black'}} onClick={() => loadState("quarantine")}>Quarantine List</Button>
        <br></br>
        <Button style={{border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black'}} onClick={() => loadState("user")}>User View</Button>
        <br></br>
        <Button style={{border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black'}} onClick={() => loadState("idea")}>Idea View</Button>
        <br></br>
        <Button style={{border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black'}} onClick={() => loadState("proposal")}>Proposal View</Button>
        <br></br>
        <Button style={{border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black'}} onClick={() => loadState("comment")}>Comment View</Button>
      </div>
      <div style={{width: '80%', marginLeft:'22%'}}>
        <CommentManagementContent users={userData!} token={token} user={user} comments={commentData} ideas={ideaData!} commentFlags={commentFlagData}/>
      </div>
      </div>
    );
  }
  return (
    <div>
    <div style={{width: 200, float:'left', height:240, marginLeft:'12%'}}>
      <Button style={{border: 'none', width: 200, textAlign: 'left', height: 40}}  onClick={() => {window.scrollTo({top: 0, left: 0, behavior: 'smooth'});}}>Dashboard</Button>
      <br></br>
      <Button style={{border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black'}} onClick={() => loadState("quarantine")}>Quarantine List</Button>
      <br></br>
      <Button style={{border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black'}} onClick={() => loadState("user")}>User View</Button>
      <br></br>
      <Button style={{border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black'}} onClick={() => loadState("idea")}>Idea View</Button>
      <br></br>
      <Button style={{border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black'}} onClick={() => loadState("proposal")}>Proposal View</Button>
      <br></br>
      <Button style={{border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black'}} onClick={() => loadState("comment")}>Comment View</Button>
    </div>
    <div style={{width: '80%', marginLeft:'22%'}}>
      <UserManagementContent users={userData!} token={token} user={user} flags={flagData} commentFlags={commentFlagData} ideas={ideaData} proposals={proposalData} comments={commentData}/>
      <br></br>
      <IdeaManagementContent users={userData!} token={token} user={user} ideas={ideaData!} flags={flagData}/>
      <br></br>
      <ProposalManagementContent users={userData!} token={token} user={user} proposals={proposalData!} ideas={propIdeaData!} flags={flagData}/>
      <br></br>
      <CommentManagementContent users={userData!} token={token} user={user} comments={commentData} ideas={ideaData!} commentFlags={commentFlagData}/>
    </div>
      
    </div>
  );
}

export default ModManagementPage