import { Button, Card, Col, Row, Image, ButtonGroup, Table } from 'react-bootstrap';
import { IIdeaWithRelationship } from '../../lib/types/data/idea.type';
import { incrementPostFlagCount } from 'src/lib/api/badPostingBehaviorRoutes';
import { useSingleProposal } from 'src/hooks/proposalHooks';
import { useSingleIdea } from 'src/hooks/ideaHooks';
import {
    capitalizeFirstLetterEachWord,
    capitalizeString,
    getIdeaSegmentsMap,
} from '../../lib/utilityFunctions';
import { useHistory } from 'react-router-dom';
import CommentsSection from '../partials/SingleIdeaContent/CommentsSection';
import RatingsSection from '../partials/SingleIdeaContent/RatingsSection';
import {
    FacebookShareButton,
    FacebookIcon,
    TwitterShareButton,
    TwitterIcon,
    RedditShareButton,
    RedditIcon,
    LineShareButton,
    LineIcon,
    WhatsappShareButton,
    WhatsappIcon,
} from 'react-share';
import ChampionSubmit from '../partials/SingleIdeaContent/ChampionSubmit';
import LoadingSpinner from '../ui/LoadingSpinner';
import LoadingSpinnerInline from '../ui/LoadingSpinnerInline';
import React, { useContext, useEffect, useState } from 'react';
import { API_BASE_URL, USER_TYPES } from 'src/lib/constants';
import { UserProfileContext } from 'src/contexts/UserProfile.Context';
import { createFlagUnderIdea, compareIdeaFlagsWithThreshold } from 'src/lib/api/flagRoutes';
import {
    followIdeaByUser,
    unfollowIdeaByUser,
    updateIdeaStatus,
    endorseIdeaByUser,
    unendorseIdeaByUser,
} from 'src/lib/api/ideaRoutes';
import { useCheckIdeaFollowedByUser, useCheckIdeaEndorsedByUser, useGetEndorsedUsersByIdea, useCheckIdeaFlaggedByUser } from 'src/hooks/ideaHooks';
import { useAllRatingsUnderIdea } from 'src/hooks/ratingHooks';
import { useAllCommentsUnderIdea, useCommentAggregateUnderIdea } from 'src/hooks/commentHooks';
import Modal from 'react-bootstrap/Modal';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

import Form from 'react-bootstrap/Form';
import { useCheckFlagBan } from 'src/hooks/flagHooks';
import EndorsedUsersSection from '../partials/SingleIdeaContent/EndorsedUsersSection';
import { IUser } from 'src/lib/types/data/user.type';
import { SegmentType, UserSegmentRelationshipEnum } from 'src/lib/types/data/segment.type';

interface SingleIdeaPageContentProps {
    ideaData: IIdeaWithRelationship;
    ideaId: string;
}

const SingleIdeaPageContent: React.FC<SingleIdeaPageContentProps> = ({
    ideaData,
    ideaId,
}) => {
    const {
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
        segments,
        author,
        state,
        active,
        reviewed,
        supportedProposal,
        // Proposal and Project info
        proposalInfo,
        projectInfo,
    } = ideaData;
    const { title: catTitle } = category!;

    const parsedDate = new Date(createdAt);

    // Social Media share for this Idea page
    // const shareUrl = 'http://github.com';
    // const shareUrl = 'https://app.mylivingcity.org'

    const shareUrl = `https://app.mylivingcity.org/ideas/${ideaId}`;
    const shareTitle = `My Living City Idea! ${title}`;
    const shareDescription = `Check out this idea on My Living City! ${description}`;

    /**
   * Checks to see if the Idea's state is of Proposal and if the proposal information
   * needed to render is available in an object.
   * @returns { boolean } Proposal information and state is valid
   */
    const confirmProposalState = (): boolean => {
        return state === 'PROPOSAL';
    };

    /**
   * Checks to see if the Idea's state is of Project and if the project information
   * needed to render is available in an object.
   * @returns { boolean } Project information and state is valid
   */
    const confirmProjectState = (): boolean => {
        return state === 'PROJECT' && !!projectInfo;
    };

    const shouldDisplayChampionButton = (): boolean => {

        return !ideaData.champion && !!ideaData.isChampionable;
    };

    const [followingPost, setFollowingPost] = useState(false);
    const [endorsingPost, setEndorsingPost] = useState(false);

    const [endorsedUsers, setEndorsedUsers] = useState<any[]>([]);

    // API hooks for this component
    const { user, token } = useContext(UserProfileContext);
    const history = useHistory();
    const { data: isFollowingPost, isLoading: isFollowingPostLoading } = useCheckIdeaFollowedByUser(token, (user ? user.id : user), ideaId);
    const { data: isEndorsingPost, isLoading: isEndorsingPostLoading } = useCheckIdeaEndorsedByUser(token, (user ? user.id : user), ideaId);
    const { data: endorsedUsersData, isLoading: isEndorsedUsersDataLoading } = useGetEndorsedUsersByIdea(token, ideaId);
    const { data: proposal } = useSingleProposal('' + (supportedProposal ? supportedProposal!.id : ''));
    const { data: proposalIdea } = useSingleIdea('' + (supportedProposal ? supportedProposal!.ideaId : ''));
    const { data: flagBanData, isLoading: flagBanDataLoading } = useCheckFlagBan(token, (user ? user.id : ''));
    const { data: isFlagged, isLoading: isFlaggedLoading } = useCheckIdeaFlaggedByUser(token, (user ? user.id : user), ideaId);
    // API hooks for children components
    const allRatingsUnderIdea = useAllRatingsUnderIdea(ideaId);
    const commentAggregateUnderIdea = useCommentAggregateUnderIdea(ideaId);
    const allCommentsUnderIdea = useAllCommentsUnderIdea(ideaId, token);

    const [showFlagButton, setShowFlagButton] = useState(true);
    const [show, setShow] = useState(false);
    const [showOther, setShowOther] = useState(false);
    const [flagReason, setFlagReason] = useState('');
    const [otherFlagReason, setOtherFlagReason] = useState('');
    function getOtherFlagReason(val: any) {
        setOtherFlagReason('OTHER: ' + val.target.value);

    }

    //Segments mapped by segmentType
    const segmentMap = getIdeaSegmentsMap(segments);

    const primarySegment = segmentMap.segment;
    const subSegment = segmentMap.subSegment;
    const superSegment = segmentMap.superSegment;

    const handleHideFlagButton = () => setShowFlagButton(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const handleCloseOther = () => setShowOther(false);
    const handleShowOther = () => setShowOther(true);

    const [showEndorseButton, setShowEndorseButton] = useState(false);
    const [userCanEndorseByOrg, setUserCanEndorseByOrg] = useState(true);

    const canEndorseByUserType = user?.userType === USER_TYPES.BUSINESS || user?.userType === USER_TYPES.COMMUNITY
        || user?.userType === USER_TYPES.MUNICIPAL || user?.userType === USER_TYPES.MUNICIPAL_SEG_ADMIN;

    const canEndorse = canEndorseByUserType && userCanEndorseByOrg;

    useEffect(() => {
        if (confirmProposalState() && proposalInfo?.id) {
            window.location.href = `/proposals/${proposalInfo.id}`;
        }
    }, [state, proposalInfo]);


    useEffect(() => {
        if (!isEndorsingPostLoading) {
            setEndorsingPost(isEndorsingPost.isEndorsed);
            setShowEndorseButton(true);
        }
    }, [isEndorsingPostLoading, isEndorsingPost]);


    useEffect(() => {
        if (!isEndorsedUsersDataLoading) {
            setEndorsedUsers(endorsedUsersData);
            // Check if current user's organizationName is in endorsements
            if (user && user.organizationName) {
                const endorsedOrgNames = endorsedUsersData
                    .filter((u: IUser) => u.id !== user.id) // Exclude current user
                    .map((u: IUser) => u.organizationName)
                    .filter(Boolean); // Remove undefined or null values
                if (endorsedOrgNames.includes(user.organizationName)) {
                    setUserCanEndorseByOrg(false);
                } else {
                    setUserCanEndorseByOrg(true);
                }
            }
        }
    }, [isEndorsedUsersDataLoading, endorsedUsersData, user]);

    const handleEndorseUnendorse = async () => {
        if (user && token) {
            if (endorsingPost) {
                // Check if user is the one who endorsed
                const userEndorsement = endorsedUsers.find(u => u.id === user.id);

                // Check if user is an admin trying to unendorse someone from their organization, not currently working properly
                const isAdminOfOrg = user.userType === USER_TYPES.MUNICIPAL_SEG_ADMIN;
                const targetEndorsement = endorsedUsers.find(u => u.organizationName === user.organizationName);
                const canAdminUnendorse = isAdminOfOrg && targetEndorsement;
                // console.log(isAdminOfOrg)

                if (!userEndorsement && !canAdminUnendorse) {
                    alert("You don't have permission to unendorse this post");
                    return;
                }

                // If admin is unendorsing someone else's endorsement
                const endorsementToRemove = userEndorsement ? user.id : targetEndorsement.id;

                await unendorseIdeaByUser(token, endorsementToRemove, ideaId);
                const newEndorsedUsers = endorsedUsers.filter(u => u.id !== endorsementToRemove);
                setEndorsedUsers(newEndorsedUsers);
                setUserCanEndorseByOrg(true);
            } else {
                await endorseIdeaByUser(token, user.id, ideaId);
                const newEndorsedUsers = [...endorsedUsers, user];
                setEndorsedUsers(newEndorsedUsers);
                setUserCanEndorseByOrg(false);
            }
            setEndorsingPost(!endorsingPost);
        }
    };


    useEffect(() => {
        if (!isFollowingPostLoading) {
            setFollowingPost(isFollowingPost.isFollowed);
        }

    }, [isFollowingPostLoading, isFollowingPost]);

    useEffect(() => {
        if (!flagBanDataLoading) {
            if (flagBanData?.flag_ban || showFlagButton === false) {
                handleHideFlagButton();
            }
        }
    }, [flagBanDataLoading, flagBanData, showFlagButton]);

    useEffect(() => {
        if (!isFlaggedLoading) {
            if (isFlagged) {
                handleHideFlagButton();
            }
        }
    }, [isFlaggedLoading, isFlagged]);

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

    const handleAuthorClick = () => {
        if (!author) return;
        
        const transformedProfile = {
            statement: '',
            contactEmail: '',
            contactPhone: '',
            address: author.address?.streetAddress || '',
            links: [],
            responsibility: author.userType === USER_TYPES.MUNICIPAL ? '' : undefined,
            description: author.userType !== USER_TYPES.MUNICIPAL ? '' : undefined,
            user: {
                id: author.id,
                fname: author.fname || '',
                lname: author.lname || '',
                userType: author.userType,
                organizationName: author.organizationName || ''
            }
        };
        
        history.push('/profile-card-display', { publicProfile: transformedProfile });
    };

    if (!active) {
        return (
            <div>Idea Is Currently Inactive</div>
        );
    }
    const flagFunc = async (ideaId: number, token: string, userId: string, ideaActive: boolean, reason: string, quarantined_at: Date) => {

        await createFlagUnderIdea(ideaId, reason, token!);
        const thresholdExceeded = await compareIdeaFlagsWithThreshold(ideaId, token!);
        await updateIdeaStatus(token, ideaId.toString(), !thresholdExceeded, false, false, quarantined_at);
    };

    const selectReasonHandler = (eventKey: string) => {
        handleShow();
        setFlagReason(eventKey!);
    };


    const selectOtherReasonHandler = (eventKey: string) => {
        handleShowOther();
        // setOtherFlagReason(eventKey!)
    };

    const submitFlagReasonHandler = async (ideaId: number, token: string, userId: string, ideaActive: boolean, quarantined_at: Date) => {
        handleClose();
        handleHideFlagButton();
        await flagFunc(ideaId, token, userId, ideaActive, flagReason, quarantined_at);
    };

    const submitOtherFlagReasonHandler = async (ideaId: number, token: string, userId: string, ideaActive: boolean, quarantined_at: Date) => {
        handleCloseOther();
        handleHideFlagButton();
        await flagFunc(ideaId, token, userId, ideaActive, otherFlagReason, quarantined_at);

    };

    return (
        <div className='single-idea-content pt-5'>
            <Card>
                {imagePath ? (
                    <Image
                        src={imagePath}
                        style={{ objectFit: 'cover', height: '400px' }}
                    ></Image>
                ) : null}
                <Row>
                    <Col sm={12}>
                        <Card.Header>
                            <div className='d-flex flex-column'>
                                <h1 className='h1 p-2 flex-grow-1'>
                                    {title && title.length > 75
                                        ? title.substring(0, 75) + '...'
                                        : title}
                                </h1>
                                <div
                                    style={{
                                        display: 'flex',
                                        minWidth: '16rem',
                                        justifyContent: 'left',
                                        marginTop: '0.5rem',
                                    }}
                                >
                                    <div>
                                        {/* <div id="flagButtonDiv" style={{display: showFlagButton ? 'block' : 'none'}}> */}
                                        {showFlagButton ? (
                                            <ButtonGroup className='mr-2'>
                                                {!reviewed ? (
                                                    <DropdownButton
                                                        id='dropdown-basic-button d-flex'
                                                        style={{
                                                            fontSize: '16px',
                                                            font: '16px sans-serif',
                                                        }}
                                                        title='Flag'
                                                    >
                                                        <Dropdown.Item
                                                            eventKey='Abusive or Inappropriate Language'
                                                            onSelect={(eventKey) =>
                                                                selectReasonHandler(eventKey!)
                                                            }
                                                        >
                                                            Abusive or Inappropriate Language
                                                        </Dropdown.Item>
                                                        <Dropdown.Item
                                                            eventKey='Submission in Wrong Community'
                                                            onSelect={(eventKey) =>
                                                                selectReasonHandler(eventKey!)
                                                            }
                                                        >
                                                            Submission in Wrong Community
                                                        </Dropdown.Item>
                                                        <Dropdown.Item
                                                            eventKey='Spam/Unsolicited Advertisement'
                                                            onSelect={(eventKey) =>
                                                                selectReasonHandler(eventKey!)
                                                            }
                                                        >
                                                            Spam/Unsolicited Advertisement
                                                        </Dropdown.Item>
                                                        <Dropdown.Item
                                                            eventKey='Unrelated to Discussion (Off Topic)'
                                                            onSelect={(eventKey) =>
                                                                selectReasonHandler(eventKey!)
                                                            }
                                                        >
                                                            Unrelated to Discussion (Off Topic)
                                                        </Dropdown.Item>
                                                        <Dropdown.Item
                                                            eventKey='Incomplete Submission (Requires Additional Details)'
                                                            onSelect={(eventKey) =>
                                                                selectReasonHandler(eventKey!)
                                                            }
                                                        >
                                                            Incomplete Submission (Requires Additional
                                                            Details)
                                                        </Dropdown.Item>
                                                        <Dropdown.Item
                                                            eventKey='Other'
                                                            onSelect={(eventKey) =>
                                                                selectOtherReasonHandler(eventKey!)
                                                            }
                                                        >
                                                            Other
                                                        </Dropdown.Item>
                                                    </DropdownButton>
                                                ) : null}
                                            </ButtonGroup>
                                        ) : null}
                                        {/* </div> */}

                                        {isFollowingPostLoading ? (
                                            <LoadingSpinnerInline />
                                        ) : (
                                            <ButtonGroup className='mr-2'>
                                                {user && token ? (
                                                    <Button
                                                        onClick={async () => await handleFollowUnfollow()}
                                                    >
                                                        {followingPost ? 'Unfollow' : 'Follow'}
                                                    </Button>
                                                ) : null}
                                            </ButtonGroup>
                                        )}
                                        {isEndorsingPostLoading ? (
                                            <LoadingSpinnerInline />
                                        ) : (
                                            <ButtonGroup className='mr-2'>
                                                {user && token && showEndorseButton && canEndorseByUserType ? (
                                                    <Button
                                                        onClick={async () => await handleEndorseUnendorse()}
                                                        disabled={!canEndorse && !endorsingPost} // Allow unendorsing even if organization already endorsed
                                                        title={!canEndorse && !endorsingPost ? 'Your organization has already endorsed this proposal' : ''}
                                                    >
                                                        {endorsingPost ? 'Unendorse' : 'Endorse'}
                                                    </Button>
                                                ) : null}
                                            </ButtonGroup>
                                        )}
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
                                <Button
                                    style={{ background: 'red' }}
                                    variant='primary'
                                    onClick={() => {
                                        submitFlagReasonHandler(
                                            parseInt(ideaId),
                                            token!,
                                            user!.id,
                                            ideaData.active,
                                            new Date()
                                        );
                                        incrementPostFlagCount(token, ideaId);
                                    }}
                                >
                                    Flag
                                </Button>
                                <Button variant='secondary' onClick={handleClose}>
                                    Cancel
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
                                        className='mb-3'
                                        controlId='exampleForm.ControlTextarea1'
                                    >
                                        <Form.Label>
                                            Please provide a short note of your reason for flagging
                                            this post:
                                        </Form.Label>
                                        <Form.Control
                                            className='otherFlagReason'
                                            placeholder='Why do you want to flag this post?'
                                            onChange={getOtherFlagReason}
                                            as='textarea'
                                            rows={3}
                                        />
                                    </Form.Group>
                                </Form>
                                Are you sure about flagging this post?
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant='secondary' onClick={handleCloseOther}>
                                    Cancel
                                </Button>
                                <Button
                                    style={{ background: 'red' }}
                                    variant='primary'
                                    onClick={() =>
                                        submitOtherFlagReasonHandler(
                                            parseInt(ideaId),
                                            token!,
                                            user!.id,
                                            ideaData.active,
                                            new Date()
                                        )
                                    }
                                >
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
                                        className='mb-3'
                                        controlId='exampleForm.ControlTextarea1'
                                    >
                                        <Form.Label>
                                            Please provide a short note of your reason for flagging
                                            this post:
                                        </Form.Label>
                                        <Form.Control
                                            className='otherFlagReason'
                                            placeholder='Why do you want to flag this post?'
                                            onChange={getOtherFlagReason}
                                            as='textarea'
                                            rows={3}
                                        />
                                    </Form.Group>
                                </Form>
                                Are you sure about flagging this post?
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant='secondary' onClick={handleCloseOther}>
                                    Cancel
                                </Button>
                                <Button
                                    style={{ background: 'red' }}
                                    variant='primary'
                                    onClick={() =>
                                        submitOtherFlagReasonHandler(
                                            parseInt(ideaId),
                                            token!,
                                            user!.id,
                                            ideaData.active,
                                            new Date()
                                        )
                                    }
                                >
                                    Flag
                                </Button>
                            </Modal.Footer>
                        </Modal>

                        <Card.Body>
                            <Row>
                                <Col>
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
                  .author-link {
                    cursor: pointer;
                    transition: color 0.2s;
                  }
                  .author-link:hover {
                    color: #549762;
                    text-decoration: underline;
                  }
                  `}
                                    </style>

                                    <div className='info-container'>
                                        <h5 className='title'>Category:&nbsp;</h5>
                                        <h5 className='value'>{capitalizeString(catTitle)}</h5>
                                    </div>
                                    {/* <h4 className='h5'>Posted by: {author?.fname}@{author?.address?.streetAddress}</h4> */}
                                    {/* <h4 className='h5'>As: {userType}</h4> */}
                                    {superSegment ? (
                                        <div className='info-container'>
                                            <h5 className='title'>District:&nbsp;</h5>
                                            <h5 className='value'>
                                                {capitalizeFirstLetterEachWord(superSegment.name)}
                                            </h5>
                                        </div>
                                    ) : null}

                                    {primarySegment ? (
                                        <div className='info-container'>
                                            <h5 className='title'>Municipality:&nbsp;</h5>
                                            <h5 className='value'>{capitalizeFirstLetterEachWord(primarySegment.name)}</h5>
                                        </div>
                                    ) : null}

                                    {subSegment ? (
                                        <div className='info-container'>
                                            <h5 className='title'>Neighborhood:&nbsp;</h5>
                                            <h5 className='value'>
                                                {capitalizeFirstLetterEachWord(subSegment.name)}
                                            </h5>
                                        </div>
                                    ) : null}

                                    {!!ideaData.champion && (
                                        <div className='info-container'>
                                            <h5 className='title'>Championed By:&nbsp;</h5>
                                            <h5 className='value'>
                                                {ideaData?.champion?.fname}@{ideaData?.champion?.address?.streetAddress}
                                            </h5>
                                        </div>
                                    )}

                                    {state ? (
                                        <div className='info-container'>
                                            <h5 className='title'>Status:&nbsp;</h5>
                                            <h5 className='value'><span>{state}</span></h5>
                                        </div>
                                    ) : null}

                                    <br />

                                    <table className='info-table'>
                                        <tbody>
                                            <tr>
                                                <td className='h5'><strong>Description:</strong></td>
                                                <td className='lead px-1'>{description}</td>
                                            </tr>
                                            {communityImpact?.trim() ? (
                                                <tr>
                                                    <td className='h5'><strong>Community and Place:</strong></td>
                                                    <td className='lead px-1'>{communityImpact}</td>
                                                </tr>
                                            ) : null}
                                            {natureImpact?.trim() ? (
                                                <tr>
                                                    <td className='h5'><strong>Nature and Food Security:</strong></td>
                                                    <td className='lead px-1'>{natureImpact}</td>
                                                </tr>
                                            ) : null}
                                            {artsImpact?.trim() ? (
                                                <tr>
                                                    <td className='h5'><strong>Arts, Culture, and Education:</strong></td>
                                                    <td className='lead px-1'>{artsImpact}</td>
                                                </tr>
                                            ) : null}
                                            {energyImpact?.trim() ? (
                                                <tr>
                                                    <td className='h5'><strong>Water and Energy:</strong></td>
                                                    <td className='lead px-1'>{energyImpact}</td>
                                                </tr>
                                            ) : null}
                                            {manufacturingImpact?.trim() ? (
                                                <tr>
                                                    <td className='h5'><strong>Manufacturing and Waste:</strong></td>
                                                    <td className='lead px-1'>{manufacturingImpact}</td>
                                                </tr>
                                            ) : null}
                                        </tbody>
                                    </table>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Col>

                    {/* Proposal State and Conditional Rendering */}
                    {(confirmProposalState() || confirmProjectState()) && (
                        <Col sm={12} className='my-3'>
                            <h2>Proposal Information</h2>
                            <p>
                                {'Proposal has been initialized. Please describe the proposal!'}
                            </p>
                        </Col>
                    )}

                    {/* Project State and Conditional Rendering */}
                    {confirmProjectState() && (
                        <Col sm={12} className='my-3'>
                            <h2>Project Information:</h2>
                            <p>
                                {projectInfo?.description ||
                                    'Project has been initialized. Please describe the project!'}
                            </p>
                        </Col>
                    )}

                    {shouldDisplayChampionButton() && (
                        <Col sm={12} className='my-3'>
                            <ChampionSubmit />
                        </Col>
                    )}

                    {/* Share functionality */}

                    <Col sm={12}>
                        <Card.Footer className='footer mt-1 d-flex justify-content-between align-items-center'>
                            <div className='footer-posted'>Posted: {parsedDate.toLocaleDateString()}</div>
                            <div className='footer-icons'>
                                <FacebookShareButton className='mx-2' url={shareUrl} quote={shareDescription} hashtag={shareTitle}>
                                    <FacebookIcon size={32} round />
                                </FacebookShareButton>
                                <TwitterShareButton className='mx-2' url={shareUrl} title={shareTitle + '\n' + shareDescription}>
                                    <TwitterIcon size={32} round />
                                </TwitterShareButton>
                                <WhatsappShareButton className='mx-2' url={shareUrl} title={shareTitle + '\n' + shareDescription}>
                                    <WhatsappIcon size={32} round />
                                </WhatsappShareButton>
                                <LineShareButton className='mx-2' url={shareUrl} title={shareTitle + '\n' + shareDescription}>
                                    <LineIcon size={32} round />
                                </LineShareButton>
                                <RedditShareButton className='mx-2' url={shareUrl} title={shareTitle + '\n' + shareDescription + '\n' + shareUrl}>
                                    <RedditIcon size={32} round />
                                </RedditShareButton>
                            </div>

                            <div className='footer-handle'>
                                {
                                    author?.userSegments?.find( seg => seg.userSegmentRelationship === UserSegmentRelationshipEnum.HOME)?.segmentId == primarySegment?.segId &&
                                    (
                                        <div>
                                            <span className='author-link' onClick={handleAuthorClick}>
                                                {author?.userHandles?.find( h => h.userSegmentRelationship === UserSegmentRelationshipEnum.HOME)?.handle ?? 
                                                `${author?.userType === USER_TYPES.BUSINESS || author?.userType === USER_TYPES.COMMUNITY ? author?.organizationName : author?.fname}@
                                                ${author?.userType === USER_TYPES.BUSINESS || author?.userType === USER_TYPES.COMMUNITY ? author?.userSegment?.[1]?.segment?.name : author?.address?.streetAddress}`}
                                            </span>{author?.userType !== USER_TYPES.BUSINESS && author?.userType !== USER_TYPES.COMMUNITY ? ' as Resident' : ''}
                                        </div>
                                    ) ||

                                    author?.userSegments?.find( seg => seg.userSegmentRelationship === UserSegmentRelationshipEnum.SCHOOL)?.segmentId == primarySegment?.segId &&

                                    (
                                        <div>
                                            <span className='author-link' onClick={handleAuthorClick}>
                                                {author?.userHandles?.find( h => h.userSegmentRelationship === UserSegmentRelationshipEnum.SCHOOL)?.handle}
                                            </span> as Student
                                        </div>
                                    ) ||

                                    author?.userSegments?.find( seg => seg.userSegmentRelationship === UserSegmentRelationshipEnum.WORK)?.segmentId == primarySegment?.segId &&
                                    (
                                        <div>
                                            <span className='author-link' onClick={handleAuthorClick}>
                                                {author?.userHandles?.find( h => h.userSegmentRelationship === UserSegmentRelationshipEnum.WORK)?.handle}
                                            </span> as Worker
                                        </div>
                                    )
                                }
                            </div>
                        </Card.Footer>
                    </Col>
                </Row>
            </Card>

            {proposal && proposalIdea && (
                <div style={{ marginTop: '2rem' }}>
                    <Card>
                        <Card.Header>
                            <div className='d-flex'>
                                <h4 className='h4 p-2 flex-grow-1'>Originating Proposal</h4>
                                <div
                                    className='p-2'
                                    style={{ marginLeft: 'auto', height: '3rem', minWidth: 150 }}
                                ></div>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <Table style={{ margin: '0rem' }} hover>
                                <thead>
                                    <tr>
                                        <th>Author</th>
                                        <th>Proposal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            {proposalIdea!.author!.organizationName}@
                                            {proposalIdea!.author!.address?.streetAddress}
                                        </td>
                                        <td>
                                            <a href={'/proposals/' + proposal!.id}>
                                                {proposalIdea!.title}
                                            </a>
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </div>
            )}
            {isEndorsedUsersDataLoading ? (
                <LoadingSpinner />
            ) : (
                endorsedUsers &&
                endorsedUsers.length > 0 && (
                    <EndorsedUsersSection endorsedUsers={endorsedUsers} />
                )
            )}

            <Row>
                <RatingsSection
                    ideaId={ideaId}
                    allRatingsUnderIdea={allRatingsUnderIdea}
                    commentAggregateUnderIdea={commentAggregateUnderIdea}
                />
            </Row>
            <Row>
                <CommentsSection
                    ideaId={ideaId}
                    allCommentsUnderIdea={allCommentsUnderIdea}
                />
            </Row>
        </div>
    );
};

export default SingleIdeaPageContent;
