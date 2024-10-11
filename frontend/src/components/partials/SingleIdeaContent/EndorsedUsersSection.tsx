import React, { useEffect } from 'react';
import {
    Card,
    Table, 
} from 'react-bootstrap';

interface EndorsedUsersSectionProps {
  endorsedUsers: any[];
}

const EndorsedUsersSection: React.FC<EndorsedUsersSectionProps> = ({ endorsedUsers }) => {
    useEffect(() => {
    }, [endorsedUsers]);

    return (
        <div style={{ marginTop: '2rem' }}>
            <Card>
                <Card.Header>
                    <div className='d-flex'>
                        <h4 className='h4 p-2 flex-grow-1'>Endorse List</h4>
                    </div>
                </Card.Header>
                <Card.Body>
                    <Table style={{margin: '0rem'}}>
                        <tbody>
                            {endorsedUsers.map((user) => (
                                <tr key={user.id}>
                                    <td>
                                        {user.organizationName || `${user.userType} Endorser - No Affiliated Organization.` } 
                                    </td>
                                </tr>
                            ))
                            }
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>   
        </div>
    );
};

export default EndorsedUsersSection;
