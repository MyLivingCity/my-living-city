import {Button, Card, Col, Row, Image, ButtonGroup, Table} from "react-bootstrap";
import { IIdeaWithRelationship } from "../../lib/types/data/idea.type";
import ProposalTile from "../tiles/ProposalTile";
import { useSingleProposal } from "src/hooks/proposalHooks";
import { useSingleIdea } from "src/hooks/ideaHooks";
import {
  capitalizeFirstLetterEachWord,
  capitalizeString,
} from "../../lib/utilityFunctions";
import CommentsSection from "../partials/SingleIdeaContent/CommentsSection";
import RatingsSection from "../partials/SingleIdeaContent/RatingsSection";
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
import { useSingleSegmentBySegmentId } from "src/hooks/segmentHooks";
import LoadingSpinner from "../ui/LoadingSpinner";
import { ISegment } from "src/lib/types/data/segment.type";
import React, { useContext, useEffect, useState } from "react";
import { API_BASE_URL } from "src/lib/constants";
import { UserProfileContext } from "src/contexts/UserProfile.Context";
import { createFlagUnderIdea, updateFalseFlagIdea, compareIdeaFlagsWithThreshold } from "src/lib/api/flagRoutes";
import { followIdeaByUser, isIdeaFollowedByUser, unfollowIdeaByUser, updateIdeaStatus } from "src/lib/api/ideaRoutes";
import CSS from "csstype"
import { useCheckIdeaFollowedByUser } from "src/hooks/ideaHooks";

import Modal from 'react-bootstrap/Modal';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

import ModalExample from "src/components/modal/Modal";
import Form from 'react-bootstrap/Form';
import { Hidden } from "@mui/material";

interface SingleIdeaPageContentProps {
  ideaData: IIdeaWithRelationship;
  ideaId: string;
}

const SingleIdeaPageContent: React.FC<SingleIdeaPageContentProps> = ({
  ideaData,
  ideaId,
}) => {
  const {
    id,
    title,
    description,
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
    state,
    active,
    reviewed,
    supportedProposal,
    // Proposal and Project info

    projectInfo,
  } = ideaData;
  const { title: catTitle } = category!;

  const parsedDate = new Date(createdAt);

  // Social Media share for this Idea page
  // const shareUrl = 'http://github.com';
  // const shareUrl = 'https://app.mylivingcity.org'
  const shareUrl = window.location.href;
  const shareTitle = `My Living City Idea! ${title}`;

  /**
   * Checks to see if the Idea's state is of Proposal and if the proposal information
   * needed to render is available in an object.
   * @returns { boolean } Proposal information and state is valid
   */
  const confirmProposalState = (): boolean => {
    return state === "PROPOSAL";
  };

  /**
   * Checks to see if the Idea's state is of Project and if the project information
   * needed to render is available in an object.
   * @returns { boolean } Project information and state is valid
   */
  const confirmProjectState = (): boolean => {
    return state === "PROJECT" && !!projectInfo;
  };

  const shouldDisplayChampionButton = (): boolean => {
    console.log(!ideaData.champion);
    console.log(!!ideaData.isChampionable);
    console.log(ideaData.champion);
    console.log(ideaData.isChampionable);

    return !ideaData.champion && !!ideaData.isChampionable;
  };

  const [followingPost, setFollowingPost] = useState(false);

  const {user, token} = useContext(UserProfileContext);
  const {data: isFollowingPost, isLoading: isFollowingPostLoading} = useCheckIdeaFollowedByUser(token, (user ? user.id : user), ideaId);
  const {data: proposal} = useSingleProposal("" + (supportedProposal ? supportedProposal.id : ""));
  const {data: proposalIdea } = useSingleIdea("" + (supportedProposal ? supportedProposal.ideaId : ""));

  const [show, setShow] = useState(false);
  const [showOther, setShowOther] = useState(false);
  const [flagReason, setFlagReason] = useState("");
  const [otherFlagReason, setOtherFlagReason] = useState("");
  function getOtherFlagReason(val: any) {
    setOtherFlagReason("OTHER: " + val.target.value)
    // console.log(val.target.value)
    // console.log(otherFlagReason)
  }
  // onInput = ({target:{otherFlagReason}}) => setOtherFlagReason(otherFlagReason),
  // onFormSubmit = e => {
  //   e.preventDefault()
  //   console.log(otherFlagReason)
  //   setOtherFlagReason()
  // }


  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleCloseOther = () => setShowOther(false);
  const handleShowOther = () => setShowOther(true);

  useEffect(() => {
    if (!isFollowingPostLoading) {
      setFollowingPost(isFollowingPost.isFollowed);
    }

  }, [isFollowingPostLoading, isFollowingPost])

  const handleFollowUnfollow = async () => {
    console.log("handleFollowUnfollow");
    let res;
    if (user && token) {
      if (followingPost) {
        res = await unfollowIdeaByUser(token, user.id, ideaId);
      } else {
        res = await followIdeaByUser(token, user.id, ideaId);
      }
      setFollowingPost(!followingPost);
    }
  };
  if(!active){
    return(
      <div>Idea Is Currently Inactive</div>
    )
  }
  const flagFunc = async(ideaId: number, token: string, userId: string, ideaActive: boolean, reason: string, quarantined_at: Date) => {
    console.log(reason)
    await createFlagUnderIdea(ideaId, reason, token!);
    const thresholdExceeded = await compareIdeaFlagsWithThreshold(ideaId, token!);
    await updateIdeaStatus(token, userId, ideaId.toString(), !thresholdExceeded, false, quarantined_at);
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
    await flagFunc(ideaId, token, userId, ideaActive, flagReason, quarantined_at);
  }

  const submitOtherFlagReasonHandler = async (ideaId: number, token: string, userId: string, ideaActive: boolean, quarantined_at: Date) => {
    handleCloseOther();
    await flagFunc(ideaId, token, userId, ideaActive, otherFlagReason, quarantined_at);
    console.log(otherFlagReason);
  }

  return (
    <div className="single-idea-content pt-5">
      <Card>
        {imagePath ? (
          <Image
            src={`${API_BASE_URL}/${imagePath}`}
            style={{ objectFit: "cover", height: "400px" }}
          ></Image>
        ) : null}
        <Row>
          <Col sm={12}>
            <Card.Header>
              <div className="d-flex">
                <h1 className="h1 p-2 flex-grow-1">{capitalizeString(title)}</h1>
                <div className="p-2 justify-content-end" >
                  <ButtonGroup className="mr-2" style={{marginRight: 'auto'}}>
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
                    <ButtonGroup className="mr-2">
                    {user && token ? <Button
                      onClick={async () => await handleFollowUnfollow()}
                    >
                      {followingPost ? "Unfollow" : "Follow"}
                    </Button> : null}
                  </ButtonGroup>
                </div>
              </div>
            </Card.Header>

            <Modal show={show} onHide={handleClose}>
              <Modal.Header closeButton>s
                <Modal.Title>Flag Confirmation</Modal.Title>
              </Modal.Header>
              <Modal.Body>Are you sure about flagging this post?</Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                  Cancel
                </Button>
                <Button style={{background: 'red'}} variant="primary"  onClick={
                  () => submitFlagReasonHandler(parseInt(ideaId), token!, user!.id, ideaData.active, new Date())
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
                      {segment
                        ? capitalizeFirstLetterEachWord(segment.name)
                        : "N/A"}
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
                  {!!ideaData.champion && (
                    <h4 className="h5">
                      Championed By: {ideaData?.champion?.fname}@
                      {ideaData?.champion?.address?.streetAddress}
                    </h4>
                  )}
                  {/* <h5 className='h5'>Created: {parsedDate.toLocaleDateString()}</h5> */}
                  <h4 className="h5">
                    Status: <span>{state}</span>
                  </h4>
                  <br />
                  <p>{description}</p>
                  {communityImpact ? (
                    <p>
                      <strong>Community and Place:</strong> {communityImpact}
                    </p>
                  ) : null}
                  {natureImpact ? (
                    <p>
                      <strong>Nature and Food Security:</strong> {natureImpact}
                    </p>
                  ) : null}
                  {artsImpact ? (
                    <p>
                      <strong>Arts, Culture, and Education:</strong>{" "}
                      {artsImpact}
                    </p>
                  ) : null}
                  {energyImpact ? (
                    <p>
                      <strong>Water and Energy:</strong> {energyImpact}
                    </p>
                  ) : null}
                  {manufacturingImpact ? (
                    <p>
                      <strong>Manufacturing and Waste:</strong>{" "}
                      {manufacturingImpact
                        ? capitalizeString(manufacturingImpact)
                        : ""}
                    </p>
                  ) : null}
                </Col>
              </Row>
            </Card.Body>
          </Col>

              {/* Proposal State and Conditional Rendering */}
              {(confirmProposalState() || confirmProjectState()) && (
                <Col sm={12} className="my-3">
                  <h2>Proposal Information</h2>
                  <p>
                    {"Proposal has been initialized. Please describe the proposal!"}
                  </p>
                </Col>
              )}

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

      {proposal && proposalIdea &&
      <div style={{ marginTop: "2rem" }}>
        <Card>
            <Card.Header>
              <div className="d-flex">
                <h4 className="h4 p-2 flex-grow-1">Originating Proposal</h4>
                <div className="p-2" style={{marginLeft: 'auto', height: '3rem', minWidth: 150}}>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              <Table style={{margin: "0rem"}} hover>
                <thead>
                <tr>
                  <th>Author</th>
                  <th>Proposal</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                  <td>
                    {proposalIdea!.author!.fname} {proposalIdea!.author!.lname}
                  </td>
                  <td>
                    <a href={"/proposals/" + proposal!.id}>
                      {proposalIdea!.title}
                    </a>
                  </td>
                </tr>
                </tbody>
              </Table>
            </Card.Body>
        </Card>
      </div>
      }

      <Row>
        <RatingsSection ideaId={ideaId} />
      </Row>
      <Row>
        <CommentsSection ideaId={ideaId} />
      </Row>
    </div>
  );
};

export default SingleIdeaPageContent;
