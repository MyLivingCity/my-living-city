import { useContext } from 'react';
import { Modal, Row, Col, Button, Spinner } from 'react-bootstrap';
import { UserProfileContext } from 'src/contexts/UserProfile.Context';
import { FindBanDetails} from 'src/hooks/banHooks';

interface WarningModalProps {
    show: boolean;
    setShow: React.Dispatch<React.SetStateAction<boolean>>;
};


export const WarningMessageModal = ({
    show, setShow
}: WarningModalProps) => {
    const closeModal = () => setShow(false);
    const { user, logout } = useContext(UserProfileContext);
    const { data, error, isLoading, isError } = FindBanDetails(user!.id);

    if (isError) {
        console.log(error);
        return (
            <div className='wrapper'>
                <p>
                    Error occured while trying to retrieve warning details. Please try again later.
                </p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <Modal
                show={show}
                size='lg'
                aria-labelledby='contained-modal-title-vcenter'
                centered>
                <Modal.Header>
                    <Col></Col>
                    <Col md={'auto'}>
                        <h4>You have been issued a Warning</h4>
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
            show={show}
            size='lg'
            aria-labelledby='contained-modal-title-vcenter'
            centered
        >
            <Modal.Header>
                <Col></Col>
                <Col md={'auto'}>
                    <h4>You have been issued a Warning</h4>
                </Col>
                <Col></Col>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col></Col>
                    <Col md={'auto'}>
                        <b>Reason: </b>{data?.banReason}
                        <p />
                    </Col>
                    <Col></Col>
                </Row>

                <Row>
                    <Col></Col>
                    <Col md={'auto'}>
                        <b>Details: </b>{data?.banMessage}
                        <p />
                    </Col>
                    <Col></Col>
                </Row>

                <Row>
                    <Col></Col>
                    <Col md={'auto'}>
                        Repeated offenses before <b>{data?.banUntil && new Date(data!.banUntil).toLocaleString()}</b> will result in a ban.
                        <p />
                    </Col>
                    <Col></Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Col></Col>
                <Col md={'auto'}>
                    <Button onClick={closeModal}>I Understand</Button>
                </Col>
                <Col md={'auto'}>
                    <Button variant='secondary' onClick={() => logout()}>Sign Out</Button>
                </Col>
                <Col></Col>
            </Modal.Footer>
        </Modal>
    );
};