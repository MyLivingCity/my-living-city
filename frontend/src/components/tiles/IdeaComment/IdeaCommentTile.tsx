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
import { capitalizeFirstLetterEachWord, capitalizeString } from '../../../lib/utilityFunctions';
// Added May 31
import { FaRegThumbsUp } from 'react-icons/fa';

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
    const { segmentId, subSegmentId, superSegmentId } = commentData?.idea;
    const { homeSegmentId, workSegmentId, schoolSegmentId,
        homeSubSegmentId, workSubSegmentId, schoolSubSegmentId,
        homeSuperSegmentId, workSuperSegmentId, schoolSuperSegmentId,
        homeSegHandle, workSegHandle, schoolSegHandle
    } = userSegments;

    const colouredUserNameHandle = (ideaId: number, homeId?: number, workId?: number, schoolId?: number) => {
        // let ideaId, homeId, workId, schoolId;
        // if(superSegmentId){
        //   ideaId = superSegmentId;
        // }else{

        // }

        let userName = 'Unknown';

        let colour = '';
        if (userType === 'SUPER_ADMIN') {
            userName = homeSegHandle + ' as Super Admin';
            colour = 'text-danger';
        }
        else if (userType === 'ADMIN') {
            userName = homeSegHandle + ' as Admin';
            colour = 'text-danger';
        } else if (userType === 'MOD') {
            userName = homeSegHandle + ' as Mod';
            colour = 'text-warning';
        } else if (userType === 'MUNICIPAL_SEG_ADMIN') {
            userName = 'Municipal Admin';
            colour = 'text-danger';
        } else if (userType === 'MUNICIPAL') {
            userName = 'Municipal Account';
            colour = 'text-warning';
        } else if (userType === 'BUSINESS') {
            userName = organizationName + '@' + address?.streetAddress + ' as Business Member';
            colour = 'text-primary';
        } else if (userType === 'Community') {
            userName = organizationName + '@' + address?.streetAddress + ' as Community Member';
            colour = 'text-primary';
        } else {
            switch (ideaId) {
                case homeId:
                    userName = homeSegHandle + ' as Resident';
                    colour = 'text-primary';
                    break;
                case workId:
                    userName = workSegHandle + ' as Worker';
                    colour = 'text-next';
                    break;
                case schoolId:
                    userName = schoolSegHandle + ' as Student';
                    colour = 'text-next';
                    break;
            }
        }
        return (<span className={`name d-block font-weight-bold ${colour}`} style={{ fontSize: '70%' }}>{userName}</span>);
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
                        <h3>{content}</h3>
                    </div>

                    {/* fontSize 120% → 160% */}
                    <div className='d-flex flex-column justify-content-start' style={{ fontSize: '170%' }}>
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

                    {isUserAuthenticated() && (
                        <div className='d-flex'>
                            <div className='d-flex align-items-center'>
                                <IdeaCommentLike commentData={commentData} />
                                <span>{likes}</span>
                            </div>
                            <div className='d-flex align-items-center ml-2 mr-4'>
                                <IdeaCommentDislike commentData={commentData} />
                                <span>{dislikes}</span>
                            </div>
                            {/*
                            <IdeaCommentLike commentData={commentData} />  
                    <IdeaCommentDislike commentData={commentData} /> {dislikes} */}
                            {/* {!reviewed ? (
              <Button onClick={
                async () => await createCommentFlagAndCheckThreshold(id, token!, new Date())
              }>Flag</Button>
              ) : null} */}
                            {!reviewed ? (
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
                    )}
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