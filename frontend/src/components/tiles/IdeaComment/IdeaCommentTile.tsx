import { useContext } from 'react';
import { Button, Col, Container, Row, ButtonGroup, Modal, Form, Badge } from 'react-bootstrap';
import { UserProfileContext } from 'src/contexts/UserProfile.Context';
import { createCommentFlagUnderIdea, compareCommentFlagsWithThreshold } from 'src/lib/api/flagRoutes';
import { updateCommentStatus } from 'src/lib/api/commentRoutes';
import { IComment } from '../../../lib/types/data/comment.type';
import { timeDifference } from '../../../lib/utilityFunctions';
import IdeaCommentDislike from './IdeaCommentDislike';
import IdeaCommentLike from './IdeaCommentLike';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import React, { useEffect, useState } from 'react';
import { useCheckFlagBan } from 'src/hooks/flagHooks';
import { capitalizeFirstLetterEachWord, capitalizeString, getUserHandle } from '../../../lib/utilityFunctions';
// Added May 31
import { FaRegThumbsUp } from 'react-icons/fa';
import { IUser } from 'src/lib/types/data/user.type';
import { USER_TYPES } from 'src/lib/constants';
import { IAddress } from 'src/lib/types/data/address.type';
import { IUserSegment } from 'src/lib/types/data/segment.type';

interface IdeaCommentTileProps {
    commentData: IComment;
}

const IdeaCommentTile = ({ commentData }: IdeaCommentTileProps) => {

    const [showFlagButton, setShowFlagButton] = useState(true);
    const [show, setShow] = useState(false);
    const [showOther, setShowOther] = useState(false);
    const [flagReason, setFlagReason] = useState('');
    const [otherFlagReason, setOtherFlagReason] = useState('');
    function getOtherFlagReason(val: any) {
        setOtherFlagReason('OTHER: ' + val.target.value);

    }


    const handleHideFlagButton = () => setShowFlagButton(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const handleCloseOther = () => setShowOther(false);
    const handleShowOther = () => setShowOther(true);


    const { token, user, isUserAuthenticated } = useContext(UserProfileContext);
    const { data: flagBanData, isLoading: flagBanDataLoading } = useCheckFlagBan(token, (user ? user.id : ''));

    const {
        id,
        ideaId,
        idea,
        authorId,
        reviewed,
        content,
        createdAt,
        updatedAt,
        _count: {
            likes,
            dislikes
        }
    } = commentData;

    const { email, fname, lname, organizationName, address, userSegments, userType } = commentData?.author;
    const { segmentId, subSegmentId, superSegmentId } = commentData as any;
    const { homeSegmentId, workSegmentId, schoolSegmentId,
        homeSubSegmentId, workSubSegmentId, schoolSubSegmentId,
        homeSuperSegmentId, workSuperSegmentId, schoolSuperSegmentId,
        homeSegHandle, workSegHandle, schoolSegHandle
    } = userSegments;

    const colouredUserNameHandle = (segmentId: number, homeId?: number, workId?: number, schoolId?: number) => {
        console.log(commentData);

        let colour = '';
        if (userType === 'SUPER_ADMIN') {
            colour = 'text-danger';
            //colour = 'text-danger';
        }
        else if (userType === 'ADMIN') {
            colour = 'text-danger';
        } else if (userType === 'MOD') {
            colour = 'text-warning';
        } else if (userType === 'MUNICIPAL_SEG_ADMIN') {
            colour = 'text-danger';
        } else if (userType === 'MUNICIPAL') {
            //colour = 'text-warning';
            colour = 'admin';
        } else if (userType === 'BUSINESS') {
            colour = 'text-primary';
        } else if (userType === 'Community') {
            colour = 'text-primary';
        } else {
            switch (segmentId) {
                case homeId:
                    colour = 'text-primary';
                    break;
                case workId:
                    colour = 'text-next';
                    break;
                case schoolId:
                    colour = 'text-next';
                    break;
            }
        }

        const author: IUser = {
            fname: fname,
            lname: lname,
            organizationName: organizationName,
            address: address as IAddress,
            userType: USER_TYPES[userType as keyof typeof USER_TYPES],
            userSegments: userSegments as any,
        } as any;
        const userName = getUserHandle(subSegmentId, segmentId, superSegmentId, author);

        return (<span className={`name d-block ${colour} !important`} style={{ fontSize: '70%' }}>{userName} - {parseUserType(author.userType)}</span>);
    };

    // const flagFunc = async(ideaId: number, token: string, userId: string, ideaActive: boolean, reason: string, quarantined_at: Date) => {
    //   await createFlagUnderIdea(ideaId, reason, token!);
    //   const thresholdExceeded = await compareIdeaFlagsWithThreshold(ideaId, token!);
    //   await updateIdeaStatus(token, userId, ideaId.toString(), !thresholdExceeded, false, quarantined_at);
    // }

    const createCommentFlagAndCheckThreshold = async (commentId: number, token: string, userId: string, reason: string, quarantined_at: Date) => {
        await createCommentFlagUnderIdea(commentId, reason, token!);
        const thresholdExceeded = await compareCommentFlagsWithThreshold(commentId, token!);
        await updateCommentStatus(token, commentId.toString(), !thresholdExceeded, false, false, quarantined_at);
    };

    const selectReasonHandler = (eventKey: string) => {
        handleShow();
        setFlagReason(eventKey!);
    };

    const selectOtherReasonHandler = (eventKey: string) => {
        handleShowOther();
        // setOtherFlagReason(eventKey!)
    };

    const submitFlagReasonHandler = async (commentId: number, token: string, userId: string, quarantined_at: Date) => {
        handleClose();
        handleHideFlagButton();
        await createCommentFlagAndCheckThreshold(id, token!, user!.id, flagReason, new Date());
    };

    const submitOtherFlagReasonHandler = async (commentId: number, token: string, userId: string, quarantined_at: Date) => {
        handleCloseOther();
        // await flagFunc(ideaId, token, userId, ideaActive, otherFlagReason, quarantined_at);
        handleHideFlagButton();
        await createCommentFlagAndCheckThreshold(id, token!, user!.id, otherFlagReason, new Date());

    };

    //   SUPER_ADMIN = 'SUPER_ADMIN',
    //   ADMIN = 'ADMIN',
    //   MOD = 'MOD',
    //   SEG_ADMIN = 'SEG_ADMIN',
    //   SEG_MOD = 'SEG_MOD',
    //   MUNICIPAL_SEG_ADMIN = 'MUNICIPAL_SEG_ADMIN',
    //   BUSINESS = 'BUSINESS',
    //   MUNICIPAL = 'MUNICIPAL',
    //   ASSOCIATE = 'ASSOCIATE',
    //   DEVELOPER = 'DEVELOPER',
    //   RESIDENTIAL = 'RESIDENTIAL',
    //   COMMUNITY = 'COMMUNITY',
    //   IN_PROGRESS = 'IN_PROGRESS',

    const parseUserType = (str: string) => {
        let result: string;
    
        switch (str) {
            case 'SUPER_ADMIN':
                result = 'super admin';
                break;
            case 'ADMIN':
                result = 'admin';
                break;
            case 'MOD':
                result = 'moderator';
                break;
            case 'SEG_ADMIN':
                result = 'segment admin';
                break;
            case 'SEG_MOD':
                result = 'segment moderator';
                break;
            case 'MUNICIPAL_SEG_ADMIN':
                result = 'municipal segment admin';
                break;
            case 'BUSINESS':
                result = 'business member';
                break;
            case 'MUNICIPAL':
                result = 'municipal';
                break;
            case 'ASSOCIATE':
                result = 'associate';
                break;
            case 'DEVELOPER':
                result = 'developer';
                break;
            case 'RESIDENTIAL':
                result = 'resident';
                break;
            case 'COMMUNITY':
                result = 'community member';
                break;
            case 'IN_PROGRESS':
                result = 'in progress';
                break;
            default:
                result = 'unknown';
                break;
        }
    
        return capitalizeFirstLetterOfEachWord(result);
    };

    const capitalizeFirstLetterOfEachWord = (str: string) => {
        return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    };

    useEffect(() => {
        if (!flagBanDataLoading) {
            if (flagBanData?.flag_ban || showFlagButton == false) {
                handleHideFlagButton();
            }
        }
    }, [flagBanDataLoading, flagBanData]);

    if (flagBanDataLoading) {
        return <div>Loading...</div>;
    }


    return (
        <Container fluid className=''>
            <hr className='bg-primary' />
            <Row className='justify-content-center' style={{ backgroundColor: userType === 'MUNICIPAL' ? '#f0fff0' : '' }}>
                <Col className='mx-2' style={{ overflow: 'visible' }}>
                    <div className='mt-2'>
                        <p>{content}</p>
                    </div>

                    <div className='d-flex flex-column justify-content-start' style={{ fontSize: '140%' }}>
                        {superSegmentId ? colouredUserNameHandle(superSegmentId, homeSuperSegmentId, workSuperSegmentId, schoolSuperSegmentId)
                            : <>
                                {subSegmentId ?
                                    colouredUserNameHandle(subSegmentId, homeSubSegmentId, workSubSegmentId, schoolSubSegmentId)
                                    :
                                    colouredUserNameHandle(segmentId, homeSegmentId, workSegmentId, schoolSegmentId)}
                            </>
                        }
                    </div>
                    <br />

                    <div className='d-flex'>
                        <div className='d-flex align-items-center'>
                            <IdeaCommentLike commentData={commentData} />
                            <span>{likes}</span>
                        </div>
                        <div className='d-flex align-items-center ml-2 mr-4'>
                            <IdeaCommentDislike commentData={commentData} />
                            <span>{dislikes}</span>
                        </div>

                        {/*  ==  changed June 14 ==
                        Show Flag button only if user is authenticated 
                        */}
                        {isUserAuthenticated() && !reviewed ? (
                            <ButtonGroup className='mr-2 mt-3' style={{ overflow: 'visible' }}>
                                {showFlagButton ? (<DropdownButton id='dropdown-basic-button' drop='up' style={{ fontSize: '10px', font: '10px sans-serif' }} title='Flag' size='sm'>
                                    <Dropdown.Item style={{ padding: '0.15rem 1.5rem', fontSize: '14px' }} eventKey='Abusive or Inappropriate Language' onSelect={(eventKey) => selectReasonHandler(eventKey!)}>Abusive or Inappropriate Language</Dropdown.Item>
                                    <Dropdown.Item style={{ padding: '0.15rem 1.5rem', fontSize: '14px' }} eventKey='Submission in Wrong Community' onSelect={(eventKey) => selectReasonHandler(eventKey!)}>Submission in Wrong Community</Dropdown.Item>
                                    <Dropdown.Item style={{ padding: '0.15rem 1.5rem', fontSize: '14px' }} eventKey='Spam/Unsolicited Advertisement' onSelect={(eventKey) => selectReasonHandler(eventKey!)}>Spam/Unsolicited Advertisement</Dropdown.Item>
                                    <Dropdown.Item style={{ padding: '0.15rem 1.5rem', fontSize: '14px' }} eventKey='Unrelated to Discussion (Off Topic)' onSelect={(eventKey) => selectReasonHandler(eventKey!)}>Unrelated to Discussion (Off Topic)</Dropdown.Item>
                                    <Dropdown.Item style={{ padding: '0.15rem 1.5rem', fontSize: '14px' }} eventKey='Incomplete Submission (Requires Additional Details)' onSelect={(eventKey) => selectReasonHandler(eventKey!)}>Incomplete Submission (Requires Additional Details)</Dropdown.Item>
                                    <Dropdown.Item style={{ padding: '0.15rem 1.5rem', fontSize: '14px' }} eventKey='Other' onSelect={(eventKey) => selectOtherReasonHandler(eventKey!)}>Other</Dropdown.Item>
                                </DropdownButton>) : null}
                            </ButtonGroup>
                        ) : null}
                    </div>
                </Col>
            </Row>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Flag Confirmation</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure about flagging this post?</Modal.Body>
                <Modal.Footer>
                    <Button variant='secondary' onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button
                        style={{ background: 'red' }}
                        variant='primary'
                        onClick={
                            // () => submitFlagReasonHandler(parseInt(ideaId), token!, user!.id, ideaData.active, new Date())
                            // async () => await createCommentFlagAndCheckThreshold(id, token!, user!.id, flagReason, new Date())
                            () => submitFlagReasonHandler(id, token!, user!.id, new Date())
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
                            className='mb-3'
                            controlId='exampleForm.ControlTextarea1'
                        >
                            <Form.Label>Please provide a short note of your reason for flagging this post:</Form.Label>
                            <Form.Control
                                className='otherFlagReason'
                                placeholder='Why do you want to flag this post?'
                                onChange={getOtherFlagReason}
                                as='textarea'
                                rows={3} />

                        </Form.Group>
                    </Form>
                    Are you sure about flagging this post?</Modal.Body>
                <Modal.Footer>
                    <Button variant='secondary' onClick={handleCloseOther}>
                        Cancel
                    </Button>
                    <Button
                        style={{ background: 'red' }}
                        variant='primary'
                        onClick={
                            () => submitOtherFlagReasonHandler(id, token!, user!.id, new Date())
                        }>
                        Flag
                    </Button>
                </Modal.Footer>
            </Modal>

            <div className='d-flex flex-column align-items-end'>
                <span className='date text-black-50' style={{ fontSize: '90%', fontStyle: 'italic' }}>
                    {timeDifference(new Date(), new Date(createdAt))}
                </span>
            </div>
        </Container>
    );
};

export default IdeaCommentTile;