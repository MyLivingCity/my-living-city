import { useContext } from 'react';
import { Modal, Row, Col, Button, Spinner } from 'react-bootstrap';
import { UserProfileContext } from 'src/contexts/UserProfile.Context';
import { FindBanDetailsWithStaleTime } from 'src/hooks/banHooks';

export const BanMessageModal = () => {
    const { user, logout } = useContext(UserProfileContext);
    const { data, error, isLoading, isError } = FindBanDetailsWithStaleTime(user!.id);

    if (isError) {
       
        return (
            <div className='wrapper'>
                <p>
                    Error occured while trying to retrieve ban details. Please try again later.
                </p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <Modal
                show
                size='lg'
                aria-labelledby='contained-modal-title-vcenter'
                centered>
                <Modal.Header>
                    <Col></Col>
                    <Col md={'auto'}>
                        <h4>You have been Banned</h4>
                    </Col>
                    <Col></Col>
                </Modal.Header>
                <Modal.Dialog/>
                <Row>
                    <Col></Col>
                    <Col md={'auto'}>
                        <Spinner animation='border' className='loading-spinner' />
                    </Col>
                    <Col></Col>
                </Row>
                <Modal.Dialog/>
                <Modal.Footer>
                    <Col></Col>
                    <Col md={'auto'}>
                        <Button>Sign Out</Button>
                    </Col>
                    <Col></Col>
                </Modal.Footer>
            </Modal>
        );
    }

    return (
        <Modal
            show
            size='lg'
            aria-labelledby='contained-modal-title-vcenter'
            centered
        >
            <Modal.Header>
                <Col></Col>
                <Col md={'auto'}>
                    <h4>You have been Banned</h4>
                </Col>
                <Col></Col>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col></Col>
                    <Col md={'auto'}>
                        <b>Reason: </b>{data!.banReason}
                        <p />
                    </Col>
                    <Col></Col>
                </Row>

                <Row>
                    <Col></Col>
                    <Col md={'auto'}>
                        <b>Details: </b>{data!.banMessage}
                        <p />
                    </Col>
                    <Col></Col>
                </Row>

                <Row>
                    <Col></Col>
                    <Col md={'auto'}>
                        <b>Your ban will be removed on: </b>{new Date(data!.banUntil).toLocaleString()}
                        <p />
                    </Col>
                    <Col></Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Col></Col>
                <Col md={'auto'}>
                    <Button onClick={() => logout()}>Sign Out</Button>
                </Col>
                <Col></Col>
            </Modal.Footer>
        </Modal>
    );
};