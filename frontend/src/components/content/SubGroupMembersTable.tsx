import { useEffect, useState } from 'react';
import { Table, Form, Button, Card, Alert, NavDropdown, Dropdown, Row, Col } from 'react-bootstrap';

interface FakeUser {
    email: string;
    organization: string;
    first: string;
    last: string;
    userType: string;
    homeSegment: string;
    schoolSegment: string;
}

interface SubGroupMembersTableProps {
    subGroupName: string;
    members: FakeUser[];
    token: string;
}

export const SubGroupMembersTable: React.FC<SubGroupMembersTableProps> = ({
    subGroupName,
    members,
    token,
}) => {

    const fields: string[] = [
        'Email',
        'Organization',
        'First',
        'Last',
        'User Type',
        'Home Segment',
        'School Segment',
        'Controls'
    ];

    const [localMembers, setLocalMembers] = useState<FakeUser[]>(members);

    useEffect(() => {
        setLocalMembers(members); 
    }, [members]);

    const handleRemoveUser = (index: number) => {
        const confirmed = window.confirm('Are you sure you want to remove this user from the subgroup? This action cannot be undone.');
        if (confirmed) {
            const updated = [...localMembers];
            updated.splice(index, 1); 
            setLocalMembers(updated);
            window.alert(`User removed from subgroup: ${subGroupName}`);
        };
    };

    return (
        <Row>
            <Col>
                <Card>
                    <Card.Header className='text-capitalize'>
                        {subGroupName} Members
                    </Card.Header>
                    <Card.Body>
                        <div className='table-responsive-lg'>
                            <Table bordered hover size='sm'>
                                <thead>
                                    <tr>
                                        {fields.map((field, index) => (
                                            <th>{field}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {localMembers.map((user, index) => (
                                        <tr key={index}>
                                            <td>{user.email}</td>
                                            <td>{user.organization}</td>
                                            <td>{user.first}</td>
                                            <td>{user.last}</td>
                                            <td>{user.userType}</td>
                                            <td>{user.homeSegment}</td>
                                            <td>{user.schoolSegment}</td>
                                            <td>
                                                <Dropdown>
                                                    <Dropdown.Toggle
                                                        as='a'
                                                        style={{
                                                            color: '#396642',
                                                            cursor: 'pointer',
                                                            textDecoration: 'none',
                                                            border: 'none',
                                                            background: 'transparent',
                                                            padding: 0,
                                                            fontWeight: 500,
                                                        }}
                                                    >
                                                    Controls
                                                    </Dropdown.Toggle>

                                                    <Dropdown.Menu>
                                                        <Dropdown.Item>Ban User</Dropdown.Item>
                                                        <Dropdown.Item>Ban History</Dropdown.Item>
                                                        <Dropdown.Item
                                                            onClick={() => handleRemoveUser(index)}
                                                            className='text-danger'
                                                        >
                                                            Remove User
                                                        </Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
};