import React, {  useContext,  useState } from 'react'
import { RouteComponentProps } from 'react-router-dom';
import { UserManagementContent } from 'src/components/content/UserManagementContent';
import { IdeaManagementContent } from 'src/components/content/IdeaManagementContent';
import { UserProfileContext } from '../contexts/UserProfile.Context';
import { useAllUsers, useBannedUsers } from 'src/hooks/userHooks';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { ProposalManagementContent } from 'src/components/content/ProposalManagementContent';
import { CommentManagementContent } from 'src/components/content/CommentManagementContent';
import { useIdeasWithBreakdown } from 'src/hooks/ideaHooks';
import { useProposalsWithBreakdown } from 'src/hooks/proposalHooks';
import { useAllCommentFlags, useAllFlags } from 'src/hooks/flagHooks';
import { useThreshold, useFalseFlagThreshold, useBadPostingThreshhold } from 'src/hooks/threshholdHooks';
import {  IIdeaWithAggregations } from 'src/lib/types/data/idea.type';
import { useAllComments } from 'src/hooks/commentHooks';
import { IUser } from 'src/lib/types/data/user.type';
import { IComment } from 'src/lib/types/data/comment.type';
import { IProposalWithAggregations } from 'src/lib/types/data/proposal.type';
import { Button } from 'react-bootstrap';
import { updateThreshhold, updateFalseFlagThreshold, updateBadPostingThreshhold } from 'src/lib/api/threshholdRoutes';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { ButtonGroup } from "react-bootstrap";
import { useAllBanDetails, useRemoveAllExpiredBans } from 'src/hooks/banHooks';
import { BannedUsersManagementContent } from 'src/components/content/BannedUsersManagementContent';
import { FalseFlagManagementContent } from 'src/components/content/FalseFlagManagementContent';
import { BadPostingManagementContent } from 'src/components/content/BadPostingManagementContent';
import { useAllFalseFlaggingUsers } from 'src/hooks/falseFlaggingBehaviorHooks';
import { useAllBadPostingUsers } from 'src/hooks/badPostingBehaviorHooks';
import { checkFalseFlaggingBehavior } from 'src/lib/api/falseFlaggingBehaviorRoutes';
import { checkThreshhold } from 'src/lib/api/badPostingBehaviorRoutes';

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
  const {data: falseFlagThreshholdData, isLoading: falseFlagThreshholdLoading} = useFalseFlagThreshold(token);
  const {data: badPostingThreshholdData, isLoading: badPostingThreshholdLoading} = useBadPostingThreshhold(token);
  const {data: banData, isLoading: banLoading} = useAllBanDetails();
  const {data: falseFlagData, isLoading: falseFlagLoading} = useAllFalseFlaggingUsers();
  const {data: badPostingData, isLoading: badPostingLoading} = useAllBadPostingUsers();
  const { isLoading: banRemovalLoading } = useRemoveAllExpiredBans(token);
  const [pageState, setPageState] = useState<String>("quarantine");
  const [filteredDay, setfilteredDay] = useState('');
  const [filteredDayProposal, setfilteredDayProposal] = useState('');
  const [filteredDayComment, setfilteredDayComment] = useState('');
  const [filteredIdeas, setfilteredIdeas] = useState<IIdeaWithAggregations[]>([])
  const [filteredProposals, setfilteredProposals] = useState<IIdeaWithAggregations[]>([])
  const [filteredComments, setfilteredComments] = useState<IComment[]>([])
  const {data: bannedUsersData, isLoading: bannedUsersLoading} = useBannedUsers(token);
  let agedQuarantinedIdeas: IIdeaWithAggregations[] = [];
  let agedQuarantinedProposals: IIdeaWithAggregations[] = [];
  let ideasAndProposals: IIdeaWithAggregations[] = [];
  let agedQuarantinedComments: IComment[] = [];
  let allComments: IComment[] = [];

  let threshhold: number = 3;
  const [newThreshold, setNewThreshhold] = useState(threshhold);

  let falseFlagThreshhold: number = 3;
  const [newFalseFlagThreshhold, setNewFalseFlagThreshhold] = useState(falseFlagThreshhold);

  let badPostingThreshhold: number = 3;
  const [newBadPostingThreshhold, setNewBadPostingThreshhold] = useState(badPostingThreshhold);


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
  if (userLoading || ideaLoading || proposalLoading || commentLoading || flagLoading || commentFlagLoading || threshholdLoading || banLoading || banRemovalLoading || bannedUsersLoading || falseFlagLoading || falseFlagThreshholdLoading || badPostingLoading || badPostingThreshholdLoading) {
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
  if (badPostingThreshholdData) {
    if (badPostingThreshholdData.number) {
      badPostingThreshhold = badPostingThreshholdData.number;
    }
  }
  if (falseFlagThreshholdData) {
    if (falseFlagThreshholdData.number) {
      falseFlagThreshhold = falseFlagThreshholdData.number;
    }
  }
  function changeThresholdData(val: any) {
    let num = parseInt(val.target.value);
    if (!isNaN(num)) {
      setNewThreshhold(num);
    }
  }
  function changeFalseFlagThresholdData(val: any) {
    let num = parseInt(val.target.value);
    if (!isNaN(num)) {
      setNewFalseFlagThreshhold(num);
    }
  }
  function changeBadPostingThreshholdData(val: any) {
    let num = parseInt(val.target.value);
    if (!isNaN(num)) {
      setNewBadPostingThreshhold(num);
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

  const changeFalseFlagThreshold = async () => {
    try {      
      await updateFalseFlagThreshold(newFalseFlagThreshhold, token!)
      await checkFalseFlaggingBehavior()
    } catch (err) {
      console.log("Error: ", err);
    } finally {
      window.location.reload();
    }

  }

  const changeBadPostingThreshhold = async () => {
    try {
      await updateBadPostingThreshhold(newBadPostingThreshhold, token!)
      await checkThreshhold()
    } catch (err) {
      console.log("Error: ", err);
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
          <div style={{ float: 'right', marginRight: '10.7%' }}>
            <p style={{ textAlign: 'right', fontSize: 18, fontWeight: 'bold' }} className='ml-10 mr-2 display-6 mb-2'>User False Flagging Behavior Threshold: {falseFlagThreshhold.toString()}</p>
            <input type="number" onChange={(val) => changeFalseFlagThresholdData(val)} style={{ textAlign: 'left', right: "0" }} className='ml-10 mr-2 display-6' />
            <Button onClick={changeFalseFlagThreshold}>Update</Button>
          </div>
          <br></br>
          <FalseFlagManagementContent users={userData} token={token} user={user} flags={flagData} commentFlags={commentFlagData} ideas={ideaData} proposals={proposalData} comments={commentData} bans={banData} falseFlaggingUsers={falseFlagData}/>
          <br></br>
          <div style={{ float: 'right', marginRight: '12.3%' }}>
          <p style={{ textAlign: 'right', fontSize: 18, fontWeight: 'bold' }} className='ml-10 mr-2 display-6 mb-2'>User Bad Posting Behavior Threshold: {badPostingThreshhold.toString()}</p>
            <input type="number" onChange={(val) => changeBadPostingThreshholdData(val)} style={{ textAlign: 'left', right: "0" }} className='ml-10 mr-2 display-6' />
            <Button onClick={changeBadPostingThreshhold}>Update</Button>
          </div>
          <BadPostingManagementContent users={userData} token={token} user={user} flags={flagData} commentFlags={commentFlagData} ideas={ideaData} proposals={proposalData} comments={commentData} bans={banData} badPostingUsers={badPostingData}/>
          <br></br>
          <div style={{ float: 'right', marginRight: '17.7%' }}>
          <p style={{ textAlign: 'right', fontSize: 18, fontWeight: 'bold' }} className='ml-10 mr-2 display-6 mb-2'>Bad Posting Threshold: {threshhold.toString()}</p>
            <input type="number" onChange={(val) => changeThresholdData(val)} style={{ textAlign: 'left', right: "0" }} className='ml-10 mr-2 display-6' />
            <Button onClick={changeThreshold}>Update</Button>
          </div>
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
          <BannedUsersManagementContent users={bannedUsersData!} />
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
