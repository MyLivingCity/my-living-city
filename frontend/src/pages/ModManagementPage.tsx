import React, { ChangeEvent, useContext, useEffect, useState } from 'react'
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
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { ButtonGroup } from "react-bootstrap";
import { now } from 'moment';
import { useAllBanDetails, useRemoveAllExpiredBans } from 'src/hooks/banHooks';
import { getAllBannedUsers } from 'src/lib/api/userRoutes';

// Extends Route component props with idea title route param
interface ModManagementProps extends RouteComponentProps<{}> {
  // Add custom added props here
}

const ModManagementPage: React.FC<ModManagementProps> = ({ }) => {
  const { token } = useContext(UserProfileContext);
  const {user} = useContext(UserProfileContext)

  const { data: userData, isLoading: userLoading} = useAllUsers(token);
  const { data: ideaData, isLoading: ideaLoading} = useIdeasWithBreakdown(20);
  const { data: proposalData, isLoading: proposalLoading} = useProposalsWithBreakdown(20);
  const { data: commentData, isLoading: commentLoading} = useAllComments();
  const { data: flagData, isLoading: flagLoading} = useAllFlags(token);
  const {data: commentFlagData, isLoading: commentFlagLoading} = useAllCommentFlags(token);
  const {data: threshholdData, isLoading: threshholdLoading} = useThreshold(token);
  const {data: banData, isLoading: banLoading} = useAllBanDetails();
  const { isLoading: banRemovalLoading } = useRemoveAllExpiredBans(token);
  const [pageState, setPageState] = useState<String>("quarantine");
  const [filteredDay, setfilteredDay] = useState('');
  const [filteredDayProposal, setfilteredDayProposal] = useState('');
  const [filteredDayComment, setfilteredDayComment] = useState('');
  const [filteredIdeas, setfilteredIdeas] = useState<IIdeaWithAggregations[]>([])
  const [filteredProposals, setfilteredProposals] = useState<IIdeaWithAggregations[]>([])
  const [filteredComments, setfilteredComments] = useState<IComment[]>([])
  let agedQuarantinedIdeas: IIdeaWithAggregations[] = [];
  let agedQuarantinedProposals: IIdeaWithAggregations[] = [];
  let ideasAndProposals: IIdeaWithAggregations[] = [];
  let agedQuarantinedComments: IComment[] = [];
  let allComments: IComment[] = [];

  let threshhold: number = 3;
  const [newThreshold, setNewThreshhold] = useState(threshhold);


  let propIdeaData: IIdeaWithAggregations[] = []
  let quarantineIdea: IIdeaWithAggregations[] = [];
  let quarantineComment: IComment[] = [];
  let allProposals: IIdeaWithAggregations[] = [];
  let quarantineProposal: IIdeaWithAggregations[] = [];
  let quarantineUser: IUser[] = [];
  let flaggedUser: number[] = [];


  function loadState(state: String) {
    setPageState(state);
  }
  if (userLoading || ideaLoading || proposalLoading || commentLoading || flagLoading || commentFlagLoading || threshholdLoading || banLoading || banRemovalLoading) {
    return(
      <div className="wrapper">
        <LoadingSpinner />
      </div>
    )
  }

  if (ideaData) {
    propIdeaData = ideaData;
  }
  if (threshholdData) {
    if (threshholdData.number) {
      threshhold = threshholdData.number;
    }
  }
  function changeThresholdData(val: any) {
    let num = parseInt(val.target.value);
    if (!isNaN(num)) {
      setNewThreshhold(num);
    }
  }
  function metThreshholdUser(user: IUser) {
    let counter: number = 0;
    for (let i = 0; i < flagData!.length; i++) {
      if (flagData![i].flaggerId === user.id && flagData![i].falseFlag === true) {
        counter = counter + 1;
      }
    }
    for (let i = 0; i < commentFlagData!.length; i++) {
      if (commentFlagData![i].flaggerId === user.id && commentFlagData![i].falseFlag === true) {
        counter = counter + 1;
      }
    }
    if (counter >= threshhold) {
      return true;
    } else {
      return false;
    }
  }
  function metThreshholdIdea(idea: IIdeaWithAggregations) {
    let counter: number = 0;
    for (let i = 0; i < flagData!.length; i++) {
      if (flagData![i].ideaId === idea.id && flagData![i].falseFlag === false) {
        counter = counter + 1;
      }
    }
    if (counter >= threshhold) {
      return true;
    } else {
      return false;
    }
  }
  function metThreshholdProposal(proposal: IProposalWithAggregations) {
    let counter: number = 0;
    for (let i = 0; i < flagData!.length; i++) {
      if (flagData![i].ideaId === proposal.idea.id && flagData![i].falseFlag === false) {
        counter = counter + 1;
      }
    }
    if (counter >= threshhold) {
      return true;
    } else {
      return false;
    }
  }
  function metThresholdComment(comment: IComment) {
    let counter: number = 0;
    for (let i = 0; i < commentFlagData!.length; i++) {
      if (commentFlagData![i].commentId === comment.id && commentFlagData![i].falseFlag === false) {
        counter = counter + 1;
      }
    }
    if (counter >= threshhold) {
      return true;
    } else {
      return false;
    }
  }

  function sortQuarantinedIdeas(idea_one: IIdeaWithAggregations, idea_two: IIdeaWithAggregations) {
    if (idea_one.quarantined_at < idea_two.quarantined_at) {
      return -1;
    }
    if (idea_one.quarantined_at > idea_two.quarantined_at) {
      return 1;
    }
    return 0;
  }

  function sortQuarantinedComments(comment_one: IComment, comment_two: IComment) {
    if (comment_one.quarantined_at < comment_two.quarantined_at) {
      return -1;
    }
    if (comment_one.quarantined_at > comment_two.quarantined_at) {
      return 1;
    }
    return 0;
  }

  if (ideaData && userData && proposalData && commentData && flagData) {
    quarantineIdea = ideaData.filter((idea, index) => (idea.state === 'IDEA' && idea.reviewed === false && idea.active === false) || (metThreshholdIdea(idea) && idea.state === 'IDEA' && idea.reviewed === false));
    allProposals = ideaData.filter((idea, index) => (idea.state === 'PROPOSAL'));
    quarantineProposal = ideaData.filter((idea, index) => (idea.state === 'PROPOSAL' && idea.reviewed === false && idea.active === false) || (metThreshholdIdea(idea) && idea.state === 'PROPOSAL' && idea.reviewed === false));

    quarantineIdea = quarantineIdea.sort(sortQuarantinedIdeas)
    quarantineProposal = quarantineProposal.sort(sortQuarantinedIdeas)
    quarantineComment = commentData.filter((comment, index) => (comment.reviewed === false && comment.active === false) || (metThresholdComment(comment) && comment.reviewed === false));
    quarantineComment = quarantineComment.sort(sortQuarantinedComments)
    quarantineUser = userData.filter((user, index) => (user.reviewed === false && user.banned === true) || (metThreshholdUser(user) && user.reviewed === false));
    ideasAndProposals = ideaData.sort(sortQuarantinedIdeas)
    allComments = commentData.sort(sortQuarantinedComments)

    // original, works
    agedQuarantinedIdeas = quarantineIdea.filter((idea) => ((Math.ceil((new Date()).getTime() - new Date((idea.quarantined_at!)).getTime()) / (1000 * 60 * 60 * 24)) > parseInt(filteredDay)))
    agedQuarantinedProposals = quarantineProposal.filter((idea) => ((Math.ceil((new Date()).getTime() - new Date((idea.quarantined_at!)).getTime()) / (1000 * 60 * 60 * 24)) > parseInt(filteredDayProposal)))
    agedQuarantinedComments = quarantineComment.filter((idea) => ((Math.ceil((new Date()).getTime() - new Date((idea.quarantined_at!)).getTime()) / (1000 * 60 * 60 * 24)) > parseInt(filteredDayComment)))
 


    if (agedQuarantinedIdeas.length > 0) {
      
    }

  }


  // TODO: Create non blocking error handling

  // extract number from label
  const handleSelect = (eventKey: string) => {
  
    setfilteredIdeas(quarantineIdea)
    setfilteredDay(eventKey);
  }

  const handleSelectProposal = (eventKey: string) => {
   
    setfilteredProposals(quarantineProposal)
    setfilteredDayProposal(eventKey);
  }

  
  const handleSelectComment = (eventKey: string) => {

    setfilteredComments(quarantineComment)
    setfilteredDayComment(eventKey);
  }

  const changeThreshold = async () => {
    try {
      await updateThreshhold(newThreshold, token!)
    } catch (err) {
      console.log(err);
    } finally {
      window.location.reload();
    }

  }

  if (pageState === "quarantine") {
    return (
      <div>
        <div className='mt-3' style={{ width: 200, float: 'left', height: 240, marginLeft: '12%' }}>
          <Button style={{ border: 'none', width: 200, textAlign: 'left', height: 40 }} onClick={() => { window.scrollTo({ top: 0, left: 0, behavior: 'smooth' }); }}>Dashboard</Button>
          <br></br>
          <Button style={{ border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black' }} onClick={() => loadState("quarantine")}>Quarantine List</Button>
          <br></br>
          <Button style={{ border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black' }} onClick={() => loadState("user")}>User View</Button>
          <br></br>
          <Button style={{ border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black' }} onClick={() => loadState("banned_users")}>Banned Users View</Button>
          <br></br>
          <Button style={{ border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black' }} onClick={() => loadState("idea")}>Idea View</Button>
          <br></br>
          <Button style={{ border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black' }} onClick={() => loadState("proposal")}>Proposal View</Button>
          <br></br>
          <Button style={{ border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black' }} onClick={() => loadState("comment")}>Comment View</Button>
        </div>
        <div style={{ width: '80%', marginLeft: '22%' }}>
          <div style={{ float: 'right', marginRight: '17.7%' }}>
            <p style={{ textAlign: 'right', fontSize: 18, fontWeight: 'bold' }} className='ml-10 mr-2 display-6 mb-2'>Current Threshhold: {threshhold.toString()}</p>
            <input type="number" onChange={(val) => changeThresholdData(val)} style={{ textAlign: 'left', right: "0" }} className='ml-10 mr-2 display-6' />
            <Button onClick={changeThreshold}>Update</Button>
          </div>
          <br></br>
          <UserManagementContent users={quarantineUser!} token={token} user={user} flags={flagData} commentFlags={commentFlagData} ideas={ideaData} proposals={proposalData} comments={commentData} bans={banData}/>
          <br></br>
          <div className="d-flex" >
            {(filteredDay === '' || filteredDay === 'all') ? (<IdeaManagementContent users={userData!} token={token} user={user} ideas={quarantineIdea!} flags={flagData} />) : <IdeaManagementContent users={userData!} token={token} user={user} ideas={agedQuarantinedIdeas!} flags={flagData} />}
            <div style={{ float: 'left', marginRight: '13.7%' }}>
              <ButtonGroup className="mr-2" style={{marginLeft: "-107%", alignContent: "left"}} >
                <DropdownButton id="dropdown-basic-button" title="Sort" style={{marginTop: "20%"}}>
                  <Dropdown.Item eventKey="all" onSelect={(eventKey) => handleSelect(eventKey!)}>See all</Dropdown.Item>
                  <Dropdown.Item eventKey="7" onSelect={(eventKey) => handleSelect(eventKey!)}>Quarantined over 7 days</Dropdown.Item>
                  <Dropdown.Item eventKey="14" onSelect={(eventKey) => handleSelect(eventKey!)}>Quarantined over 14 days</Dropdown.Item>
                  <Dropdown.Item eventKey="30" onSelect={(eventKey) => handleSelect(eventKey!)}>Quarantined over 30 days</Dropdown.Item>
                </DropdownButton>
              </ButtonGroup>
            </div>
          </div>
          <br></br>
          <div className="d-flex">
            {(filteredDayProposal === '' || filteredDayProposal === 'all') ? (<ProposalManagementContent users={userData!} token={token} user={user} proposals={quarantineProposal!} ideas={quarantineProposal!} flags={flagData} />) : <ProposalManagementContent users={userData!} token={token} user={user} proposals={agedQuarantinedProposals!} ideas={agedQuarantinedProposals!} flags={flagData} />}
            <div style={{ float: 'right', marginRight: '13.7%' }}>
              <ButtonGroup className="mr-2" style={{marginLeft: "-107%", alignContent: "left"}} >
                <DropdownButton id="dropdown-basic-button" title="Sort" style={{marginTop: "20%"}} >
                  <Dropdown.Item eventKey="all" onSelect={(eventKey) => handleSelectProposal(eventKey!)}>See all</Dropdown.Item>
                  <Dropdown.Item eventKey="7" onSelect={(eventKey) => handleSelectProposal(eventKey!)}>Quarantined over 7 days</Dropdown.Item>
                  <Dropdown.Item eventKey="14" onSelect={(eventKey) => handleSelectProposal(eventKey!)}>Quarantined over 14 days</Dropdown.Item>
                  <Dropdown.Item eventKey="30" onSelect={(eventKey) => handleSelectProposal(eventKey!)}>Quarantined over 30 days</Dropdown.Item>
                </DropdownButton>
              </ButtonGroup>
            </div>
          </div>
          <br></br>
          <div className="d-flex">
            {(filteredDayComment === '' || filteredDayComment === 'all') ? (<CommentManagementContent users={userData!} token={token} user={user} comments={quarantineComment} ideas={ideaData!} commentFlags={commentFlagData} />) : <CommentManagementContent users={userData!} token={token} user={user} comments={agedQuarantinedComments} ideas={ideaData!} commentFlags={commentFlagData} />}
            <div style={{ float: 'right', marginRight: '13.7%' }}>
              <ButtonGroup className="mr-2" style={{marginLeft: "-107%", alignContent: "left"}}>
                <DropdownButton id="dropdown-basic-button" title="Sort" style={{marginTop: "20%"}}  >
                  <Dropdown.Item eventKey="all" onSelect={(eventKey) => handleSelectComment(eventKey!)}>See all</Dropdown.Item>
                  <Dropdown.Item eventKey="7" onSelect={(eventKey) => handleSelectComment(eventKey!)}>Quarantined over 7 days</Dropdown.Item>
                  <Dropdown.Item eventKey="14" onSelect={(eventKey) => handleSelectComment(eventKey!)}>Quarantined over 14 days</Dropdown.Item>
                  <Dropdown.Item eventKey="30" onSelect={(eventKey) => handleSelectComment(eventKey!)}>Quarantined over 30 days</Dropdown.Item>
                </DropdownButton>
              </ButtonGroup>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (pageState === "user") {
    return (
      <div>
        <div style={{ width: 200, float: 'left', height: 240, marginLeft: '12%' }}>
          <Button style={{ border: 'none', width: 200, textAlign: 'left', height: 40 }} onClick={() => { window.scrollTo({ top: 0, left: 0, behavior: 'smooth' }); }}>Dashboard</Button>
          <br></br>
          <Button style={{ border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black' }} onClick={() => loadState("quarantine")}>Quarantine List</Button>
          <br></br>
          <Button style={{ border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black' }} onClick={() => loadState("user")}>User View</Button>
          <br></br>
          <Button style={{ border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black' }} onClick={() => loadState("banned_users")}>Banned Users View</Button>
          <br></br>
          <Button style={{ border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black' }} onClick={() => loadState("idea")}>Idea View</Button>
          <br></br>
          <Button style={{ border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black' }} onClick={() => loadState("proposal")}>Proposal View</Button>
          <br></br>
          <Button style={{ border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black' }} onClick={() => loadState("comment")}>Comment View</Button>
        </div>
        <div style={{ width: '80%', marginLeft: '22%' }}>
          <UserManagementContent users={userData!} token={token} user={user} flags={flagData} commentFlags={commentFlagData} ideas={ideaData} proposals={proposalData} comments={commentData} bans={banData} />
        </div>
      </div>
    );
  }
  if (pageState === "idea") {
    return (
      <div>
        <div style={{ width: 200, float: 'left', height: 240, marginLeft: '12%' }}>
          <Button style={{ border: 'none', width: 200, textAlign: 'left', height: 40 }} onClick={() => { window.scrollTo({ top: 0, left: 0, behavior: 'smooth' }); }}>Dashboard</Button>
          <br></br>
          <Button style={{ border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black' }} onClick={() => loadState("quarantine")}>Quarantine List</Button>
          <br></br>
          <Button style={{ border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black' }} onClick={() => loadState("user")}>User View</Button>
          <br></br>
          <Button style={{ border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black' }} onClick={() => loadState("banned_users")}>Banned Users View</Button>
          <br></br>
          <Button style={{ border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black' }} onClick={() => loadState("idea")}>Idea View</Button>
          <br></br>
          <Button style={{ border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black' }} onClick={() => loadState("proposal")}>Proposal View</Button>
          <br></br>
          <Button style={{ border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black' }} onClick={() => loadState("comment")}>Comment View</Button>
        </div>
        <div style={{ width: '80%', marginLeft: '22%' }}>
          <IdeaManagementContent users={userData!} token={token} user={user} ideas={ideasAndProposals!} flags={flagData} />
        </div>
      </div>
    );
  }
  if (pageState === "proposal") {
    return (
      <div>
        <div style={{ width: 200, float: 'left', height: 240, marginLeft: '12%' }}>
          <Button style={{ border: 'none', width: 200, textAlign: 'left', height: 40 }} onClick={() => { window.scrollTo({ top: 0, left: 0, behavior: 'smooth' }); }}>Dashboard</Button>
          <br></br>
          <Button style={{ border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black' }} onClick={() => loadState("quarantine")}>Quarantine List</Button>
          <br></br>
          <Button style={{ border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black' }} onClick={() => loadState("user")}>User View</Button>
          <br></br>
          <Button style={{ border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black' }} onClick={() => loadState("banned_users")}>Banned Users View</Button>
          <br></br>
          <Button style={{ border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black' }} onClick={() => loadState("idea")}>Idea View</Button>
          <br></br>
          <Button style={{ border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black' }} onClick={() => loadState("proposal")}>Proposal View</Button>
          <br></br>
          <Button style={{ border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black' }} onClick={() => loadState("comment")}>Comment View</Button>
        </div>
        <div style={{ width: '80%', marginLeft: '22%' }}>
          <ProposalManagementContent users={userData!} token={token} user={user} proposals={allProposals!} ideas={propIdeaData!} flags={flagData} />
        </div>
      </div>
    );
  }
  if (pageState === "comment") {
    return (
      <div>
        <div style={{ width: 200, float: 'left', height: 240, marginLeft: '12%' }}>
          <Button style={{ border: 'none', width: 200, textAlign: 'left', height: 40 }} onClick={() => { window.scrollTo({ top: 0, left: 0, behavior: 'smooth' }); }}>Dashboard</Button>
          <br></br>
          <Button style={{ border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black' }} onClick={() => loadState("quarantine")}>Quarantine List</Button>
          <br></br>
          <Button style={{ border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black' }} onClick={() => loadState("user")}>User View</Button>
          <br></br>
          <Button style={{ border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black' }} onClick={() => loadState("banned_users")}>Banned Users View</Button>
          <br></br>
          <Button style={{ border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black' }} onClick={() => loadState("idea")}>Idea View</Button>
          <br></br>
          <Button style={{ border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black' }} onClick={() => loadState("proposal")}>Proposal View</Button>
          <br></br>
          <Button style={{ border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black' }} onClick={() => loadState("comment")}>Comment View</Button>
        </div>
        <div style={{ width: '80%', marginLeft: '22%' }}>
          <CommentManagementContent users={userData!} token={token} user={user} comments={commentData} ideas={ideaData!} commentFlags={commentFlagData} />
        </div>
      </div>
    );
  }

  if (pageState === "banned_users") {
    console.log("banned users", getAllBannedUsers())
    return (
      <div>
        <div style={{ width: 200, float: 'left', height: 240, marginLeft: '12%' }}>
          <Button style={{ border: 'none', width: 200, textAlign: 'left', height: 40 }} onClick={() => { window.scrollTo({ top: 0, left: 0, behavior: 'smooth' }); }}>Dashboard</Button>
          <br></br>
          <Button style={{ border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black' }} onClick={() => loadState("quarantine")}>Quarantine List</Button>
          <br></br>
          <Button style={{ border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black' }} onClick={() => loadState("user")}>User View</Button>
          <br></br>
          <Button style={{ border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black' }} onClick={() => loadState("banned_users")}>Banned Users View</Button>
          <br></br>
          <Button style={{ border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black' }} onClick={() => loadState("idea")}>Idea View</Button>
          <br></br>
          <Button style={{ border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black' }} onClick={() => loadState("proposal")}>Proposal View</Button>
          <br></br>
          <Button style={{ border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black' }} onClick={() => loadState("comment")}>Comment View</Button>
        </div>
        <div style={{ width: '80%', marginLeft: '22%' }}>
          <CommentManagementContent users={userData!} token={token} user={user} comments={commentData} ideas={ideaData!} commentFlags={commentFlagData} />
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
      <Button style={{ border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black' }} onClick={() => loadState("banned_users")}>Banned Users View</Button>
      <br></br>
      <Button style={{border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black'}} onClick={() => loadState("idea")}>Idea View</Button>
      <br></br>
      <Button style={{border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black', borderBottom: '1px solid black'}} onClick={() => loadState("proposal")}>Proposal View</Button>
      <br></br>
      <Button style={{border: 'none', width: 200, textAlign: 'left', height: 40, backgroundColor: '#F1F2F2', color: 'black'}} onClick={() => loadState("comment")}>Comment View</Button>
    </div>
    <div style={{width: '80%', marginLeft:'22%'}}>
      <UserManagementContent users={userData!} token={token} user={user} flags={flagData} commentFlags={commentFlagData} ideas={ideaData} proposals={proposalData} comments={commentData} bans={banData}/>
      <br></br>
      <IdeaManagementContent users={userData!} token={token} user={user} ideas={ideaData!} flags={flagData}/>
      <br></br>
      <ProposalManagementContent users={userData!} token={token} user={user} proposals={quarantineProposal!} ideas={propIdeaData!} flags={flagData}/>
      <br></br>
      <CommentManagementContent users={userData!} token={token} user={user} comments={commentData} ideas={ideaData!} commentFlags={commentFlagData}/>
    </div>

    </div>
  );
}

export default ModManagementPage
