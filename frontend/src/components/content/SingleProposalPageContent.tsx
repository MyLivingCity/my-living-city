import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import {
  Button,
  Card,
  Col,
  Row,
  Image,
  Form,
  Modal,
  Alert,
  Table, ButtonGroup,
} from "react-bootstrap";
import { IIdeaWithRelationship } from "../../lib/types/data/idea.type";
import {
  capitalizeFirstLetterEachWord,
  capitalizeString,
} from "../../lib/utilityFunctions";
import LoadingSpinnerInline from '../ui/LoadingSpinnerInline';
import CommentsSection from "../partials/SingleIdeaContent/CommentsSection";
import RatingsSection from "../partials/SingleIdeaContent/RatingsSection";
import { FeedbackRatingScaleSection, FeedbackRatingYesNoSection } from "../partials/SingleIdeaContent/FeedbackRatingSection";
import {
  FacebookShareButton,
  FacebookIcon,
  TwitterShareButton,
  TwitterIcon,
  RedditShareButton,
  RedditIcon,
  LineShareButton,
  LineIcon,
  EmailShareButton,
  EmailIcon,
  WhatsappShareButton,
  WhatsappIcon,
} from "react-share";
import ChampionSubmit from "../partials/SingleIdeaContent/ChampionSubmit";
import React, { useContext, useEffect, useState } from "react";
import { API_BASE_URL, USER_TYPES } from "src/lib/constants";
import { UserProfileContext } from "../../contexts/UserProfile.Context";
import { IFetchError } from "../../lib/types/types";
import { useFormik } from "formik";
import "react-image-crop/dist/ReactCrop.css";
import { handlePotentialAxiosError } from "../../lib/utilityFunctions";
import { 
  followIdeaByUser, 
  unfollowIdeaByUser, 
  updateIdeaStatus, 
  endorseIdeaByUser, 
  unendorseIdeaByUser,
} from "src/lib/api/ideaRoutes";
import { incrementPostFlagCount } from 'src/lib/api/badPostingBehaviorRoutes';
import { useCheckIdeaFollowedByUser, useCheckIdeaEndorsedByUser, useCheckIdeaFlaggedByUser, useGetEndorsedUsersByIdea } from "src/hooks/ideaHooks";
import { useAllRatingsUnderIdea } from "src/hooks/ratingHooks";
import { useCommentAggregateUnderIdea, useAllCommentsUnderIdea } from "src/hooks/commentHooks";
import {
  postCreateCollabotator,
  postCreateVolunteer,
  postCreateDonor,
} from "src/lib/api/communityRoutes";
import { createFlagUnderIdea, compareIdeaFlagsWithThreshold } from "src/lib/api/flagRoutes";
import { useCheckFlagBan } from 'src/hooks/flagHooks';
import EndorsedUsersSection from '../partials/SingleIdeaContent/EndorsedUsersSection';
import { IUserSegment } from "../../lib/types/data/segment.type";
import {getMyUserSegmentInfo} from "../../lib/api/userSegmentRoutes";
import { useAllUserSegments } from 'src/hooks/userSegmentHooks';
import { BsPeople, BsHeartHalf } from "react-icons/bs";
import { AiOutlineRadiusBottomright, AiOutlineStar } from "react-icons/ai";


interface SingleIdeaPageContentProps {
  ideaData: IIdeaWithRelationship;
  proposalData: any;
  ideaId: string;
}

const getSegmentName = (segment: string | undefined): string => {
  return segment ? capitalizeFirstLetterEachWord(segment) : "N/A";
}

const SingleProposalPageContent: React.FC<SingleIdeaPageContentProps> = ({
  ideaData,
  proposalData,
  ideaId,

}) => {
  const {
    title: titleText,
    description: descriptionText,
    requirements: proposalText,
    proposal_role: proposorText,
    proposal_benefits: benefitText,
    imagePath,
    userType,
    communityImpact,
    natureImpact,
    artsImpact,
    energyImpact,
    manufacturingImpact,
    createdAt,
    category,
    segment,
    subSegment,
    superSegment,
    author,
    reviewed,
    state,
    active,
    // Proposal and Project info

    projectInfo,
  } = ideaData;

  const {
    id: proposalId,
    suggestedIdeas,
    collaborations,
    volunteers,
    donors,
    needCollaborators,
    needVolunteers,
    needDonations,
    needSuggestions,
    location,
    feedback1,
    feedback2,
    feedback3,
    feedback4,
    feedback5,
    feedbackType1,
    feedbackType2,
    feedbackType3,
    feedbackType4,
    feedbackType5,
  } = proposalData;


  const { title: catTitle } = category!;

  const parsedDate = new Date(createdAt);

  // Social Media share for this Idea page
  // const shareUrl = 'http://github.com';
  // const shareUrl = 'https://app.mylivingcity.org'
  const shareUrl = window.location.href;
  const shareTitle = `My Living City Idea! ${titleText}`;


  /**
   * Checks to see if the Idea's state is of Project and if the project information
   * needed to render is available in an object.
   * @returns { boolean } Project information and state is valid
   */
  const confirmProjectState = (): boolean => {
    return state === "PROJECT" && !!projectInfo;
  };

  const shouldDisplayChampionButton = (): boolean => {
    return !ideaData.champion && !!ideaData.isChampionable;
  };

  const [showProposalSegmentError, setShowProposalSegmentError] = useState(false);

  function redirectToIdeaSubmit() {
    let name = subSegment?.name

    if (name && subSegment) {
      if (subSegment.segId === userSegmentData.homeSubSegmentId || subSegment.segId === userSegmentData.workSubSegmentId || subSegment.segId === userSegmentData.schoolSubSegmentId) {
        const communityOfInterest = getSegmentName(name);
        window.location.href = `/submit?supportedProposal=${proposalId}&communityOfInterest=${communityOfInterest}`;
      } else {
        setShowProposalSegmentError(true);
      }
    }
    
    if (!name && segment) {
      name = segment.name

      if (name && segment) {
        if (segment.segId === userSegmentData.homeSegmentId || segment.segId === userSegmentData.workSegmentId || segment.segId === userSegmentData.schoolSegmentId) {
          const communityOfInterest = getSegmentName(name);
          window.location.href = `/submit?supportedProposal=${proposalId}&communityOfInterest=${communityOfInterest}`;
        } else {
          setShowProposalSegmentError(true);
        }
      }
    }

    if (!name && superSegment) {
      name = superSegment.name
      if (superSegment.superSegId === userSegmentData.homeSuperSegId || superSegment.superSegId === userSegmentData.workSuperSegId || superSegment.superSegId === userSegmentData.schoolSuperSegId) {
        const communityOfInterest = getSegmentName(name);
        window.location.href = `/submit?supportedProposal=${proposalId}&communityOfInterest=${communityOfInterest}`;
      } else {
        setShowProposalSegmentError(true);
      }
    }
  }

  const { token, user } = useContext(UserProfileContext);
  const {data: userSegmentData, isLoading: userSegementLoading} = useAllUserSegments( token, user?.id || null)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<IFetchError | null>(null);

  const [modalShowCollaborator, setModalShowCollaborator] = useState(false);
  const [modalShowVolunteer, setModalShowVolunteer] = useState(false);
  const [modalShowDonor, setModalShowDonor] = useState(false);

  const [showFlagButton, setShowFlagButton] = useState(true);
  const [show, setShow] = useState(false);
  const [showOther, setShowOther] = useState(false);
  const [flagReason, setFlagReason] = useState("");
  const [otherFlagReason, setOtherFlagReason] = useState("");
  function getOtherFlagReason(val: any) {
    setOtherFlagReason("OTHER: " + val.target.value)
  
  }

  const handleHideFlagButton = () => setShowFlagButton(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleCloseOther = () => setShowOther(false);
  const handleShowOther = () => setShowOther(true);

  const collaboratorSubmitHandler = async (values: any) => {
    try {
      // Set loading and error state
      
      setError(null);
      setIsLoading(true);
      setTimeout(() => console.log("timeout"), 5000);
      await postCreateCollabotator(
        proposalId,
        values,
        user!.banned,
        token
      );
  
      setError(null);
      formikCollaborator.resetForm();
      window.location.reload();
    } catch (error) {
      const genericMessage =
        "An error occured while trying to create an Proposal.";
      const errorObj = handlePotentialAxiosError(genericMessage, error);
      setError(errorObj);
    } finally {
      setIsLoading(false);
    }
  };

  const volunteerSubmitHandler = async (values: any) => {
    try {
      // Set loading and error state
   
      setError(null);
      setIsLoading(true);
      setTimeout(() => console.log("timeout"), 5000);
      await postCreateVolunteer(
        proposalId,
        values,
        user!.banned,
        token
      );
    
      setError(null);
      formikVolunteer.resetForm();
      window.location.reload();
    } catch (error) {
      const genericMessage = "An error occured while trying to create an Idea.";
      const errorObj = handlePotentialAxiosError(genericMessage, error);
      setError(errorObj);
    } finally {
      setIsLoading(false);
    }
  };

  const donorSubmitHandler = async (values: any) => {
    try {
      // Set loading and error state
     
      setError(null);
      setIsLoading(true);
      setTimeout(() => console.log("timeout"), 5000);
      await postCreateDonor(
        proposalId,
        values,
        user!.banned,
        token
      );
    
      setError(null);
      formikDonor.resetForm();
      window.location.reload();
    } catch (error) {
      const genericMessage = "An error occured while trying to create an Idea.";
      const errorObj = handlePotentialAxiosError(genericMessage, error);
      setError(errorObj);
    } finally {
      setIsLoading(false);
    }
  };

  const formikCollaborator = useFormik({
    initialValues: {
      experience: "",
      role: "",
      time: "",
      contactInfo: "",
    },
    onSubmit: collaboratorSubmitHandler,
  });

  const formikVolunteer = useFormik({
    initialValues: {
      experience: "",
      task: "",
      time: "",
      contactInfo: "",
    },
    onSubmit: volunteerSubmitHandler,
  });

  const formikDonor = useFormik({
    initialValues: {
      donations: "",
      contactInfo: "",
    },
    onSubmit: donorSubmitHandler
  });


 

  const [followingPost, setFollowingPost] = useState(false);
  const [endorsingPost, setEndorsingPost] = useState(false);
  const [endorsedUsers, setEndorsedUsers] = useState<any[]>([]);
  
  // API hooks for this component
  const {data: isFollowingPost, isLoading: isFollowingPostLoading} = useCheckIdeaFollowedByUser(token, (user ? user.id : user), ideaId);
  const {data: isEndorsingPost, isLoading: isEndorsingPostLoading} = useCheckIdeaEndorsedByUser(token, (user ? user.id : user), ideaId);
  const {data: flagBanData, isLoading: flagBanDataLoading} = useCheckFlagBan(token, (user ? user.id : ""));
  const {data: isFlagged, isLoading: isFlaggedLoading} = useCheckIdeaFlaggedByUser(token, (user ? user.id : user), ideaId);
  const {data: endorsedUsersData, isLoading: isEndorsedUsersDataLoading} = useGetEndorsedUsersByIdea(token, ideaId);
 
  // API hooks for children components
  const allRatingsUnderIdea = useAllRatingsUnderIdea(ideaId);
  const commentAggregateUnderIdea = useCommentAggregateUnderIdea(ideaId);
  const allCommentsUnderIdea = useAllCommentsUnderIdea(ideaId, token);

  const canEndorse = user?.userType === USER_TYPES.BUSINESS || user?.userType === USER_TYPES.COMMUNITY 
  || user?.userType === USER_TYPES.MUNICIPAL || user?.userType === USER_TYPES.MUNICIPAL_SEG_ADMIN; 
  const [showEndorseButton, setShowEndorseButton] = useState(false);

  useEffect(() => {
    if (!isEndorsingPostLoading) {
      setEndorsingPost(isEndorsingPost.isEndorsed);
      setShowEndorseButton(true);
    }
  }, [isEndorsingPostLoading, isEndorsingPost])

  const handleEndorseUnendorse = async () => {
    if (user && token) {
      if (endorsingPost) {
        await unendorseIdeaByUser(token, user.id, ideaId);
        const newEndorsedUsers = endorsedUsers.filter(u => u.id !== user.id)
        setEndorsedUsers(newEndorsedUsers);
      } else {
        await endorseIdeaByUser(token, user.id, ideaId);
        const newEndorsedUsers = [...endorsedUsers, user];
        setEndorsedUsers(newEndorsedUsers);
      }
      setEndorsingPost(!endorsingPost);
    }
  }
  


  useEffect(() => {
    if (!isEndorsedUsersDataLoading) {
      setEndorsedUsers(endorsedUsersData);
    }
  }, [isEndorsedUsersDataLoading, endorsedUsersData])

  const [showFollowButton, setShowFollowButton] = useState(false);
  useEffect(() => {
    if (!isFollowingPostLoading) {
      setFollowingPost(isFollowingPost.isFollowed);
      setShowFollowButton(true);
    }

  }, [isFollowingPostLoading, isFollowingPost])

  useEffect(() => {
    if (!flagBanDataLoading) {
      if (flagBanData?.flag_ban || showFlagButton === false) {
        handleHideFlagButton();
      }
    }
  }, [flagBanDataLoading, flagBanData, showFlagButton])

  useEffect(() => {
    if (!isFlaggedLoading) {
      console.log("isFlagged", isFlagged?.valueOf());
      if (isFlagged) {
        console.log("isFlaggedRAWR", isFlagged?.valueOf());
        handleHideFlagButton();
      }
    }
  }, [isFlaggedLoading, isFlagged])

  const handleFollowUnfollow = async () => {
    if (user && token) {
      if (followingPost) {
        await unfollowIdeaByUser(token, user.id, ideaId);
      } else {
        await followIdeaByUser(token, user.id, ideaId);
      }
      setFollowingPost(!followingPost);
    }
  };

  let isPostAuthor = false;
  if (user) {
    isPostAuthor = author!.id === user!.id;
  }

  const flagFunc = async(ideaId: number, token: string, userId: string, ideaActive: boolean, reason: string, quarantined_at: Date) => {
    await createFlagUnderIdea(ideaId, reason, token!);
    const thresholdExceeded = await compareIdeaFlagsWithThreshold(ideaId, token!);
    await updateIdeaStatus(token, ideaId.toString(), !thresholdExceeded, false, false, quarantined_at);
  }

  const selectReasonHandler = (eventKey: string) => {
    handleShow();
    setFlagReason(eventKey!)
  }

  const selectOtherReasonHandler = (eventKey: string) => {
    handleShowOther();
    // setOtherFlagReason(eventKey!)
  }

  const submitFlagReasonHandler = async (ideaId: number, token: string, userId: string, ideaActive: boolean, quarantined_at: Date) => {
    handleClose();
    handleHideFlagButton();
    await flagFunc(ideaId, token, userId, ideaActive, flagReason, quarantined_at);
  }

  if (!active) {
    return (
      <div>Proposal Is Currently Inactive</div>
    )
  }

  const submitOtherFlagReasonHandler = async (ideaId: number, token: string, userId: string, ideaActive: boolean, quarantined_at: Date) => {
    handleCloseOther();
    handleHideFlagButton();
    await flagFunc(ideaId, token, userId, ideaActive, otherFlagReason, quarantined_at);
    
  }

  const ratingAvgUpdated = Number(ideaData.ratingAvg);

  if(!active){
    return (
      <div>Proposal Is Currently Inactive</div>
    )
  }



 




  return (
    <div className="single-idea-content pt-5">
      <style>
        {`
        .canvasjs-chart-credit {
          display: none;
        }
        .mouse-pointer:hover {
          cursor: pointer;
        }
        b {
          color: grey;
        }
        b:hover {
          cursor: pointer;
          text-decoration:underline;
          color: grey;
        }
        `}
      </style>
      <Card>
        {imagePath ? (
          <Image
            src={imagePath}
            style={{ objectFit: "cover", height: "400px" }}
          ></Image>
        ) : null}
        <Row>
          <Col sm={12}>
            <Card.Header>
              <div className="d-flex flex-column justify-content-between">
                <h1 className="h1">{
                  titleText.length > 75 ?
                  titleText.substring(0, 75) + "..." :
                  titleText
                }</h1>
                <div style={{display: "flex", minWidth: "16rem", justifyContent: "left", marginTop: "0.5rem"}}>
                  <div>
                {flagBanDataLoading ? <LoadingSpinnerInline/> : showFlagButton ? (<ButtonGroup className="mr-2">
                  {!reviewed ? (
                        <DropdownButton id="dropdown-basic-button d-flex" style={{ fontSize: "16px", font: "16px sans-serif" }} title="Flag">
                        <Dropdown.Item eventKey= "Abusive or Inappropriate Language" onSelect={(eventKey) => selectReasonHandler(eventKey!)}>Abusive or Inappropriate Language</Dropdown.Item>
                        <Dropdown.Item eventKey= "Submission in Wrong Community" onSelect={(eventKey) => selectReasonHandler(eventKey!)}>Submission in Wrong Community</Dropdown.Item>
                        <Dropdown.Item eventKey= "Spam/Unsolicited Advertisement" onSelect={(eventKey) => selectReasonHandler(eventKey!)}>Spam/Unsolicited Advertisement</Dropdown.Item>
                        <Dropdown.Item eventKey= "Unrelated to Discussion (Off Topic)" onSelect={(eventKey) => selectReasonHandler(eventKey!)}>Unrelated to Discussion (Off Topic)</Dropdown.Item>
                        <Dropdown.Item eventKey= "Incomplete Submission (Requires Additional Details)" onSelect={(eventKey) => selectReasonHandler(eventKey!)}>Incomplete Submission (Requires Additional Details)</Dropdown.Item>
                        <Dropdown.Item eventKey= "Other" onSelect={(eventKey) => selectOtherReasonHandler(eventKey!)}>Other</Dropdown.Item>
                      </DropdownButton>
                      ) : null}
                  </ButtonGroup>
                  ) : null}
                  <ButtonGroup className="mr-2">
                    {user && token && showFollowButton ? <Button
                      onClick={async () => await handleFollowUnfollow()}
                    >
                      {followingPost ? "Unfollow" : "Follow"}
                    </Button> : null}
                  </ButtonGroup>
                  <ButtonGroup className="mr-2">
                    {user && token && showEndorseButton && canEndorse ? <Button
                      onClick={async () => await handleEndorseUnendorse()}
                    >
                      {endorsingPost ? "Unendorse" : "Endorse"}
                    </Button> : null}
                  </ButtonGroup>
                </div>
                </div>
              </div>
            </Card.Header>

            <Modal show={show} onHide={handleClose}>
              <Modal.Header closeButton>
                <Modal.Title>Flag Confirmation</Modal.Title>
              </Modal.Header>
              <Modal.Body>Are you sure about flagging this post?</Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                  Cancel
                </Button>
                <Button style={{background: 'red'}} variant="primary"  onClick={
                  () => {submitFlagReasonHandler(parseInt(ideaId), token!, user!.id, ideaData.active, new Date())
                  incrementPostFlagCount(token, ideaId);}
                }>
                  Flag
                </Button>
              </Modal.Footer>
            </Modal>

            <Modal show={showOther} onHide={handleCloseOther}>
              <Modal.Header closeButton>
                <Modal.Title>Flag Confirmation</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form>
                  <Form.Group
                    className="mb-3"
                    controlId="exampleForm.ControlTextarea1"
                  >
                    <Form.Label>Please provide a short note of your reason for flagging this post:</Form.Label>
                    <Form.Control
                      className="otherFlagReason"
                      placeholder="Why do you want to flag this post?"
                      onChange={getOtherFlagReason}
                      as="textarea"
                      rows={3} />

                  </Form.Group>
                </Form>
                Are you sure about flagging this post?</Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseOther}>
                  Cancel
                </Button>
                <Button style={{background: 'red'}} variant="primary"  onClick={
                  () => submitOtherFlagReasonHandler(parseInt(ideaId), token!, user!.id, ideaData.active, new Date())
                }>
                  Flag
                </Button>
              </Modal.Footer>
            </Modal>

            <Card.Body>
              <Row>
                <Col>
                  <h4 className="h5">Category: {capitalizeString(catTitle)}</h4>
                  {/* <h4 className='h5'>Posted by: {author?.fname}@{author?.address?.streetAddress}</h4> */}
                  {/* <h4 className='h5'>As: {userType}</h4> */}
                  {superSegment ? (
                    <h4 className="h5">
                      District:{" "}
                      {superSegment
                        ? capitalizeFirstLetterEachWord(superSegment.name)
                        : "N/A"}
                    </h4>
                  ) : null}
                  {segment ? (
                    <h4 className="h5">
                      Municipality:{" "}
                      {getSegmentName(segment.name)}
                    </h4>
                  ) : null}
                  {subSegment ? (
                    <h4 className="h5">
                      Neighborhood:{" "}
                      {subSegment
                        ? capitalizeFirstLetterEachWord(subSegment.name)
                        : "N/A"}
                    </h4>
                  ) : null}
                  {location ? (
                    <h4 className="h5">Location: {location}</h4>
                  ) : null}
                  {!!ideaData.champion && (
                    <h4 className="h5">
                      Championed By: {ideaData?.champion?.fname}@
                      {ideaData?.champion?.address?.streetAddress}
                    </h4>
                  )}
                  {/* <h5 className='h5'>Created: {parsedDate.toLocaleDateString()}</h5> */}

                  {state ? (
                    <h4 className="h5">
                      Status: <span>{state}</span>
                    </h4>
                  ) : null}

                  <br />
                    <p>
                      <strong>Proposer Info:</strong> {proposorText}<br />
                    </p>
                    <p>
                      <strong>Description:</strong> {descriptionText}<br />
                    </p>
                    <p>
                      <strong>Community Benefits:</strong> {benefitText}<br />
                    </p>

                    <p>
                      <strong>Requirements:</strong> {proposalText}<br />
                    </p>
                    <p>
                      <strong>Community and Place:</strong> {communityImpact}
                    </p>
                    <p>
                      <strong>Nature and Food Security:</strong> {natureImpact}
                    </p>
                    <p>
                      <strong>Arts, Culture, and Education:</strong> {artsImpact}
                    </p>
                    <p>
                      <strong>Water and Energy:</strong> {energyImpact}
                    </p>
                    <p>
                      <strong>Manufacturing and Waste:</strong> 
                      {manufacturingImpact ? capitalizeString(manufacturingImpact) : ""}
                    </p>
                </Col>
              </Row>
            </Card.Body>
          </Col>

          {/* Proposal State and Conditional Rendering */}
          {/*{(confirmProposalState() || confirmProjectState()) && (
            <Col sm={12} className="my-3">
              <h2>Proposal Information</h2>
              <p>
                {}
                {""}
              </p>
            </Col>
          )}*/}

          {/* Project State and Conditional Rendering */}
          {confirmProjectState() && (
            <Col sm={12} className="my-3">
              <h2>Project Information:</h2>
              <p>
                {projectInfo?.description ||
                  "Project has been initialized. Please describe the project!"}
              </p>
            </Col>
          )}

          {shouldDisplayChampionButton() && (
            <Col sm={12} className="my-3">
              <ChampionSubmit />
            </Col>
          )}

          {/* Share functionality */}

          <Col sm={12}>
            <Card.Footer className="mt-1 d-flex justify-content-between">
              <div>Posted: {parsedDate.toLocaleDateString()}</div>
              <div>
                <FacebookShareButton
                  className="mx-2"
                  url={shareUrl}
                  quote={shareTitle}
                >
                  <FacebookIcon size={32} round />
                </FacebookShareButton>
                <TwitterShareButton
                  className="mx-2"
                  url={shareUrl}
                  title={shareTitle}
                >
                  <TwitterIcon size={32} round />
                </TwitterShareButton>
                <WhatsappShareButton
                  className="mx-2"
                  url={shareUrl}
                  title={shareTitle}
                >
                  <WhatsappIcon size={32} round />
                </WhatsappShareButton>
                <LineShareButton
                  className="mx-2"
                  url={shareUrl}
                  title={shareTitle}
                >
                  <LineIcon size={32} round />
                </LineShareButton>
                <RedditShareButton
                  className="mx-2"
                  url={shareUrl}
                  title={shareTitle}
                >
                  <RedditIcon size={32} round />
                </RedditShareButton>
                <EmailShareButton
                  className="mx-2"
                  url={shareUrl}
                  title={shareTitle}
                >
                  <EmailIcon size={32} round />
                </EmailShareButton>
              </div>
              <div>
                {author?.fname}@{author?.address?.streetAddress} as {userType}
              </div>
            </Card.Footer>
          </Col>
        </Row>
      </Card>

      {needCollaborators && (
        <div style={{ marginTop: "2rem" }}>
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="h4">Collaborators</h4>
                  <p>Join to be part of the project team</p>
                </div>

                <h4 className="text-center my-auto text-muted">
                  <div className="collab">
                    <Button
                      variant="primary"
                      onClick={() => setModalShowCollaborator(true)}
                    >
                      Join
                    </Button>
                    <Modal
                      show={modalShowCollaborator}
                      onHide={() => setModalShowCollaborator(false)}
                      size="lg"
                      aria-labelledby="contained-modal-title-vcenter"
                      centered
                    >
                      <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                          Collaborate
                        </Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                        <Form onSubmit={formikCollaborator.handleSubmit}>
                          <Form.Group>
                            <p style={{ fontSize: "1rem" }}>Contact</p>
                            <Form.Control
                              type="text"
                              name="contactInfo"
                              onChange={formikCollaborator.handleChange}
                              value={formikCollaborator.values.contactInfo}
                              placeholder="What is your contact information (e-mail and/or phone number)?"
                            />
                            <br />
                            <p style={{ fontSize: "1rem" }}>Time</p>
                            <Form.Control
                              type="text"
                              name="time"
                              onChange={formikCollaborator.handleChange}
                              value={formikCollaborator.values.time}
                              placeholder="How much time per week or per month do you have
                                available?"
                            />
                            <br />
                            <p style={{ fontSize: "1rem" }}>Experience</p>
                            <Form.Control
                              type="text"
                              name="experience"
                              onChange={formikCollaborator.handleChange}
                              value={formikCollaborator.values.experience}
                              placeholder="What experience and skills do you bring to the
                                project?"
                            />
                            <br />

                            <p style={{ fontSize: "1rem" }}>Role</p>
                            <Form.Control
                              type="text"
                              name="role"
                              onChange={formikCollaborator.handleChange}
                              value={formikCollaborator.values.role}
                              placeholder="What role or task would you would like to work on?"
                            />
                            <br />

                            {error && (
                              <Alert variant="danger" className="error-alert">
                                {error.message}
                              </Alert>
                            )}
                          </Form.Group>
                          <Button
                            variant="primary"
                            type="submit"
                            disabled={isLoading ? true : false}
                          >
                            {isLoading ? "Saving..." : "Submit"}
                          </Button>
                        </Form>
                      </Modal.Body>
                    </Modal>
                  </div>
                </h4>
              </div>
            </Card.Header>
            {isPostAuthor ? (
              <Card.Body>
                {collaborations.length > 0 ? (
                  <Table style={{ margin: "0rem" }} hover>
                    <thead>
                      <tr>
                        <th>Collaborator</th>
                        <th>Contact</th>
                        <th>Time</th>
                        <th>Experience</th>
                        <th>Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {collaborations.map(
                        (collaboration: any, index: number) => (
                          <tr>
                            <td>
                              {collaboration.author.fname}{" "}
                              {collaboration.author.lname}
                            </td>
                            <td>{collaboration.contactInfo}</td>
                            <td>{collaboration.time}</td>
                            <td>{collaboration.experience}</td>
                            <td>{collaboration.role}</td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </Table>
                ) : (
                  <p style={{ margin: "0rem", textAlign: "center" }}>
                    No collaborators yet, be the first!
                  </p>
                )}
              </Card.Body>
            ) : (
              <Card.Body>
                {collaborations.length > 0 ? (
                  <Table style={{ margin: "0rem" }} hover>
                    <thead>
                      <tr>
                        <th>Collaborator</th>
                      </tr>
                    </thead>
                    <tbody>
                      {collaborations.map(
                        (collaboration: any, index: number) => (
                          <tr>
                            <td>
                              {collaboration.author.fname}{" "}
                              {collaboration.author.lname}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </Table>
                ) : (
                  <p style={{ margin: "0rem", textAlign: "center" }}>
                    No collaborators yet, be the first!
                  </p>
                )}
              </Card.Body>
            )}
          </Card>
        </div>
      )}
      {needVolunteers && (
        <div style={{ marginTop: "2rem" }}>
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="h4">Volunteers</h4>
                  <p>Help support this project by becoming a volunteer</p>
                </div>

                <h4 className="text-center my-auto text-muted">
                  <div className="volunteer">
                    <Button
                      variant="primary"
                      onClick={() => setModalShowVolunteer(true)}
                    >
                      Sign-up
                    </Button>
                    <Modal
                      show={modalShowVolunteer}
                      onHide={() => setModalShowVolunteer(false)}
                      size="lg"
                      aria-labelledby="contained-modal-title-vcenter"
                      centered
                    >
                      <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                          Volunteer
                        </Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                        <Form onSubmit={formikVolunteer.handleSubmit}>
                          <Form.Group>
                            <p style={{ fontSize: "1rem" }}>Contact</p>
                            <Form.Control
                              type="text"
                              name="contactInfo"
                              onChange={formikVolunteer.handleChange}
                              value={formikVolunteer.values.contactInfo}
                              placeholder="What is your contact information (e-mail and/or phone number)?"
                            />
                            <br />
                            <p style={{ fontSize: "1rem" }}>Time</p>
                            <Form.Control
                              type="text"
                              name="time"
                              onChange={formikVolunteer.handleChange}
                              value={formikVolunteer.values.time}
                              placeholder="How much time do you want to contribute?"
                            />
                            <br />

                            <p style={{ fontSize: "1rem" }}>Experience</p>

                            <Form.Control
                              type="text"
                              name="experience"
                              onChange={formikVolunteer.handleChange}
                              value={formikVolunteer.values.experience}
                              placeholder="What experience and skills do you bring to the project?"
                            />
                            <br />

                            <p style={{ fontSize: "1rem" }}>Task</p>
                            <Form.Control
                              type="text"
                              name="task"
                              onChange={formikVolunteer.handleChange}
                              value={formikVolunteer.values.task}
                              placeholder="What type of task would you like to work on?"
                            />
                            <br />

                            {error && (
                              <Alert variant="danger" className="error-alert">
                                {error.message}
                              </Alert>
                            )}
                          </Form.Group>
                          <Button
                            variant="primary"
                            type="submit"
                            disabled={isLoading ? true : false}
                          >
                            {isLoading ? "Saving..." : "Submit"}
                          </Button>
                        </Form>
                      </Modal.Body>
                    </Modal>
                  </div>
                </h4>
              </div>
            </Card.Header>
            {isPostAuthor ? (
              <Card.Body>
                {volunteers.length > 0 ? (
                  <Table style={{ margin: "0rem" }} hover>
                    <thead>
                      <tr>
                        <th>Volunteer</th>
                        <th>Contact</th>
                        <th>Time</th>
                        <th>Experience</th>
                        <th>Task</th>
                      </tr>
                    </thead>
                    <tbody>
                      {volunteers.map((volunteer: any, index: number) => (
                        <tr>
                          <td>
                            {volunteer.author.fname} {volunteer.author.lname}
                          </td>
                          <td>{volunteer.contactInfo}</td>
                          <td>{volunteer.time}</td>
                          <td>{volunteer.experience}</td>
                          <td>{volunteer.task}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <p style={{ margin: "0rem", textAlign: "center" }}>
                    No volunteers yet, be the first!
                  </p>
                )}
              </Card.Body>
            ) : (
              <Card.Body>
                {volunteers.length > 0 ? (
                  <Table style={{ margin: "0rem" }} hover>
                    <thead>
                      <tr>
                        <th>Volunteer</th>
                      </tr>
                    </thead>
                    <tbody>
                      {volunteers.map((volunteer: any, index: number) => (
                        <tr>
                          <td>
                            {volunteer.author.fname}@{volunteer.author.address.streetAddress}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <p style={{ margin: "0rem", textAlign: "center" }}>
                    No volunteers yet, be the first!
                  </p>
                )}
              </Card.Body>
            )}
          </Card>
        </div>
      )}

      {needDonations && (
        <div style={{ marginTop: "2rem" }}>
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="h4">Donors</h4>
                  <p>Donate to help this project grow</p>
                </div>

                <h4 className="text-center my-auto text-muted">
                  <div className="donor">
                    <Button
                      variant="primary"
                      onClick={() => setModalShowDonor(true)}
                    >
                      Donate
                    </Button>
                    <Modal
                      show={modalShowDonor}
                      onHide={() => setModalShowDonor(false)}
                      size="lg"
                      aria-labelledby="contained-modal-title-vcenter"
                      centered
                    >
                      <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                          Donate
                        </Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                        <Form onSubmit={formikDonor.handleSubmit}>
                          <Form.Group>
                            <p style={{ fontSize: "1rem" }}>Donation</p>
                            <Form.Control
                              type="text"
                              name="donations"
                              onChange={formikDonor.handleChange}
                              value={formikDonor.values.donations}
                              placeholder="What would you like to contribute?"
                            />
                            <br />
                            <p style={{ fontSize: "1rem" }}>Contact</p>
                            <Form.Control
                              type="text"
                              name="contactInfo"
                              onChange={formikDonor.handleChange}
                              value={formikDonor.values.contactInfo}
                              placeholder="What is your contact information (e-mail and/or phone number)?"
                            />
                            <br />
                            {error && (
                              <Alert variant="danger" className="error-alert">
                                {error.message}
                              </Alert>
                            )}
                          </Form.Group>
                          <Button
                            variant="primary"
                            type="submit"
                            disabled={isLoading ? true : false}
                          >
                            {isLoading ? "Saving..." : "Submit"}
                          </Button>
                        </Form>
                      </Modal.Body>
                    </Modal>
                  </div>
                </h4>
              </div>
            </Card.Header>
            {isPostAuthor ? (
              <Card.Body>
                {donors.length > 0 ? (
                  <Table style={{ margin: "0rem" }} hover>
                    <thead>
                      <tr>
                        <th>Donor</th>
                        <th>Contact</th>
                        <th>Donation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donors.map((donor: any, index: number) => (
                        <tr>
                          <td>
                            {donor.author.fname} {donor.author.lname}
                          </td>
                          <td>{donor.contactInfo}</td>
                          <td>{donor.donations}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <p style={{ margin: "0rem", textAlign: "center" }}>
                    No donors yet, be the first!
                  </p>
                )}
              </Card.Body>
            ) : (
              <Card.Body>
                {donors.length > 0 ? (
                  <Table style={{ margin: "0rem" }} hover>
                    <thead>
                      <tr>
                        <th>Donor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donors.map((donor: any, index: number) => (
                        <tr>
                          <td>
                            {donor.author.fname}@{donor.author.address.streetAddress}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <p style={{ margin: "0rem", textAlign: "center" }}>
                    No donors yet, be the first!
                  </p>
                )}
              </Card.Body>
            )}
          </Card>
        </div>
      )}

      {needSuggestions && (
        <div style={{ marginTop: "2rem" }}>
          <Card>
            {showProposalSegmentError ? (
              <Alert
                variant="danger"
                dismissible
                onClose={() => setShowProposalSegmentError(false)}
              >
                Error! You cannot propose ideas for communities to which you do not belong.
              </Alert>
            ) : null}
            <Card.Header>
              <div className="d-flex justify-content-between">
                <h4 className="h4">Suggested Ideas</h4>
                {/** create a textbox */}

                <h4 className="text-center my-auto text-muted">
                  <Button onClick={() => redirectToIdeaSubmit()}>
                    Propose Idea
                  </Button>
                </h4>
              </div>
            </Card.Header>
            <Card.Body>
              {suggestedIdeas.length > 0 ? (
                <Table style={{ margin: "0rem" }} hover>
                  <thead>
                    <tr>
                      <th>Author</th>
                      <th>Idea</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suggestedIdeas.map((suggestion: any, index: number) => (
                      <tr>
                        <td>
                          {suggestion.author.fname} {suggestion.author.lname}
                        </td>
                        <td>
                          <a href={"/ideas/" + suggestion.id}>
                            {suggestion.title}
                          </a>
                        </td>
                        <div className="d-flex align-content-center">
                        <td className="px-2 text-muted d-flex flex-column justify-content-center align-items-center">
                          <AiOutlineStar className="" /><p className="mb-0 user-select-none">{ratingAvgUpdated.toFixed(1)}</p>
                        </td>
                        <td className="px-2 text-muted d-flex flex-column justify-content-center align-items-center">
                          <BsPeople className="" />
                          <p className="mb-0 user-select-none">{suggestion.ratingCount + suggestion.commentCount}</p>
                        </td>
                        <td className="px-2 text-muted d-flex flex-column justify-content-center align-items-center">
                          <BsHeartHalf />
                          <p className="mb-0 user-select-none">{suggestion.posRatings}/{suggestion.negRatings}</p>
                        </td>
                        </div>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p style={{ margin: "0rem", textAlign: "center" }}>
                  No suggestions yet, be the first!
                </p>
              )}
            </Card.Body>
          </Card>
        </div>
      )}

      {feedback1 && (
        <div style={{ marginTop: "2rem" }}>
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between">
                <h4 className="h4">Specific Feedbacks</h4>
                {/** create a textbox */}

                <h4 className="text-center my-auto text-muted">
                </h4>
              </div>
            </Card.Header>
            <Card.Body>
            {feedback1 ? (
              <Card>
              <Card.Header></Card.Header>
              <Card.Body>
                    <p>
                      <strong>Specific Feedback 1: </strong> {feedback1}
                    </p>
                    {feedbackType1 === "YESNO" ? (
                          <FeedbackRatingYesNoSection
                            feedbackId = {"1"}
                            proposalId = {proposalId}
                          >
                          </FeedbackRatingYesNoSection>
                          ) : null}
                        {feedbackType1 === "RATING" ? (
                          <FeedbackRatingScaleSection
                            feedbackId = {"1"}
                            proposalId = {proposalId}
                          >
                          </FeedbackRatingScaleSection>
                        ) : null}
                      </Card.Body>
                    </Card>
                  ) : null}

            {feedback2 ? (
              <Card>
              <Card.Header></Card.Header>
              <Card.Body>
                    <p>
                      <strong>Specific Feedback 2: </strong> {feedback2}
                    </p>
                    {feedbackType2 === "YESNO" ? (
                          <FeedbackRatingYesNoSection
                            feedbackId = {"2"}
                            proposalId = {proposalId}
                          >
                          </FeedbackRatingYesNoSection>
                          ) : null}
                        {feedbackType2 === "RATING" ? (
                          <FeedbackRatingScaleSection
                            feedbackId = {"2"}
                            proposalId = {proposalId}
                          >
                          </FeedbackRatingScaleSection>
                        ) : null}
                </Card.Body>
              </Card>
                  ) : null}

            {feedback3 ? (
              <Card>
              <Card.Header></Card.Header>
              <Card.Body>
                    <p>
                      <strong>Specific Feedback 3: </strong> {feedback3}
                    </p>
                    {feedbackType3 === "YESNO" ? (
                              <FeedbackRatingYesNoSection
                                feedbackId = {"3"}
                                proposalId = {proposalId}
                              >
                              </FeedbackRatingYesNoSection>
                              ) : null}
                            {feedbackType3 === "RATING" ? (
                              <FeedbackRatingScaleSection
                                feedbackId = {"3"}
                                proposalId = {proposalId}
                              >
                              </FeedbackRatingScaleSection>
                            ) : null}
                    </Card.Body>
                  </Card>
                  ) : null}

            {feedback4 ? (
              <Card>
              <Card.Header></Card.Header>
              <Card.Body>
                    <p>
                      <strong>Specific Feedback 4: </strong> {feedback4}
                    </p>
                    {feedbackType4 === "YESNO" ? (
                              <FeedbackRatingYesNoSection
                                feedbackId = {"4"}
                                proposalId = {proposalId}
                              >
                              </FeedbackRatingYesNoSection>
                              ) : null}
                            {feedbackType4 === "RATING" ? (
                              <FeedbackRatingScaleSection
                                feedbackId = {"4"}
                                proposalId = {proposalId}
                              >
                              </FeedbackRatingScaleSection>
                            ) : null}
                    </Card.Body>
                  </Card>
                  ) : null}

            {feedback5 ? (
              <Card>
              <Card.Header></Card.Header>
              <Card.Body>
                    <p>
                      <strong>Specific Feedback 5: </strong> {feedback5}
                    </p>
                    {feedbackType5 === "YESNO" ? (
                              <FeedbackRatingYesNoSection
                                feedbackId = {"5"}
                                proposalId = {proposalId}
                              >
                              </FeedbackRatingYesNoSection>
                              ) : null}
                            {feedbackType5 === "RATING" ? (
                              <FeedbackRatingScaleSection
                                feedbackId = {"5"}
                                proposalId = {proposalId}
                              >
                              </FeedbackRatingScaleSection>
                            ) : null}
                    </Card.Body>
                  </Card>
                  ) : null}
            </Card.Body>
          </Card>
        </div>
      )}

      {endorsedUsers && endorsedUsers.length > 0 && 
        <EndorsedUsersSection endorsedUsers={endorsedUsers}/>
      }

      <Row>
      <RatingsSection ideaId={ideaId} allRatingsUnderIdea={allRatingsUnderIdea} commentAggregateUnderIdea={commentAggregateUnderIdea}/>
      </Row>
      <Row>
        <CommentsSection ideaId={ideaId} allCommentsUnderIdea={allCommentsUnderIdea}/>
      </Row>
    </div>
  );
};

export default SingleProposalPageContent;
