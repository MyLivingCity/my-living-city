import React, { useState } from 'react';
import { Form, Tab, Tabs, Modal, Button } from 'react-bootstrap';
import { ISegment, ISuperSegment } from '../../../lib/types/data/segment.type';
import { IUser } from '../../../lib/types/data/user.type';
import { EditUserInfoModalPage } from './components/EditUserInfoModalPage';
import { useEditUserInfoModal } from './hooks/useEditUserInfoModal';
import { EventKey } from 'react-bootstrap/esm/types';
import { CommentsModalPage } from './components/CommentsModalPage';
import { PostsModalPage } from './components/PostsModalPage';

export interface EditUserInfoModalProps {
    setShow: React.Dispatch<React.SetStateAction<boolean>>;
    show: boolean;
    modalUser: IUser;
    currentUser: IUser;
    token: string | null;
    segs?: ISuperSegment[] | undefined;
    subSeg?: ISegment[] | undefined;
    changesSaved?: (updatedUser: IUser) => void;
    editSegmentsOnly?: boolean;
    editSegmentOnlySegment?: ISegment;
};

export const EditUserInfoModal = (props: EditUserInfoModalProps) => {
    const { setShow, show } = props;
    const [key, setKey] = useState<EventKey | undefined>('userInfo');
    const hook = useEditUserInfoModal(props);

    // TODO - Update Reach Ideas on save.
    // console.log('selectedReachIds', hook.selectedReachSegIds);

    return (
        <Modal
            show={show}
            onHide={() => setShow(false)}
            size='lg'
        >
            <Modal.Header closeButton>
                <Modal.Title id='contained-modal-title-vcenter'>
                    User Info
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={hook.handleSubmit}>
                <Modal.Body>
                    <Tabs
                        id='controlled-tab'
                        activeKey={key}
                        onSelect={(k) => setKey(k || '')}
                        className='mb-3'
                    >
                        <Tab eventKey='userInfo' title='User Info'>
                            <EditUserInfoModalPage
                                parentProps={props}
                                hook={hook}
                            />
                        </Tab>
                        <Tab eventKey='posts' title='Ideas'>
                            <PostsModalPage
                                posts={hook.posts}
                                isLoading={hook.loadingPosts}
                            />
                        </Tab>
                        <Tab eventKey='comments' title='Comments'>
                            <CommentsModalPage 
                                comments={hook.comments} 
                                isLoading={hook.loadingComments}
                            />
                        </Tab>
                    </Tabs>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant='secondary' onClick={() => setShow(false)}>
                        Close
                    </Button>
                    <Button variant='primary' type='submit'>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};
