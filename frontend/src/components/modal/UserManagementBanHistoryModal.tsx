import { Button, Container, Form, Modal, Row, Table } from 'react-bootstrap';
import { IUser } from 'src/lib/types/data/user.type';

interface BanHistoryModalProps {
    setShow: React.Dispatch<React.SetStateAction<boolean>>;
    show: boolean;
    modalUser: IUser;
    currentUser: IUser;
    token: string | null,
    data: JSX.Element[]
};

export const UserManagementBanHistoryModal = ({
    setShow,
    show,
    modalUser,
    currentUser,
    token,
    data,
}: BanHistoryModalProps) => {
    const handleClose = () => setShow(false);
    return (
        <Modal
            show={show}
            onHide={handleClose}
            backdrop="static"
            centered
            size='lg'
            keyboard={false}>
            <Modal.Header closeButton>
                <Container>
                    <Row className='justify-content-center'>
                        <Modal.Title>{modalUser.id}'s Ban History</Modal.Title>
                    </Row>
                </Container>
            </Modal.Header>
            <Modal.Body>
                <Table>
                    {data}
                </Table>
            </Modal.Body>
            <Modal.Footer>
                <div className="w-100 d-flex justify-content-center">
                    <Button 
                    className = "mr-3"
                    variant="secondary" 
                    onClick={handleClose}>
                        Close
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    )
}