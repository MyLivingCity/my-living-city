import React, { useState } from 'react'
import { Card, Table, Dropdown, Container, Button, Form, NavDropdown } from 'react-bootstrap';
import { IBanUserInfo } from 'src/lib/types/data/banUser.type';

// THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO 
// THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO 
// THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO 
interface BannedUsersManagementContentProps {
    users: IBanUserInfo[] | undefined;
}

export const BannedUsersManagementContent: React.FC<BannedUsersManagementContentProps> = ({users}) => {
    let userEmail : String[] = [];
    let userFirstName : String[] = [];
    let userLastName : String[] = [];
    let userType: String[] = [];
    let banType: String[] = [];
    let banReason: String[] = [];
    let banMessage: String[] = [];
    let banDate: Date[] = [];
    let banEndDate: Date[] = [];
    let banDuration: String[] = [];

    if(users){
        for(let i = 0; i < users!.length; i++){
            userEmail.push(users[i].email);
            userFirstName.push(users[i].firstName!);
            userLastName.push(users[i].lastName!);
            userType.push(users[i].userType!);
            banType.push(users[i].banType!);
            banReason.push(users[i].banReason!);
            banMessage.push(users[i].banMessage!);
            banDate.push(users[i].createdAt!);
            banEndDate.push(users[i].banUntil!);

            // Format ban duration
            if (users[i].banDuration === 99999){
                banDuration.push("Permanent");
            } else if (users[i].banDuration === 365){
                banDuration.push("1 year");
            } else if (users[i].banDuration === 180){
                banDuration.push("6 months");
            } else if (users[i].banDuration === 90){
                banDuration.push("3 months");
            } else {
                banDuration.push(users[i].banDuration + " days");
            }
        }
    }

        return (
            <Container style={{maxWidth: '80%', marginLeft: 50}}>
            <Form>
            <h2 className="mb-4 mt-4">Banned Users Management</h2>
            <Table bordered hover size="sm">
            <thead className="table-active">
                <tr>
                <th scope="col">Email</th>
                <th scope="col">First</th>
                <th scope="col">Last</th>
                <th scope="col">User Type</th>
                <th scope="col">Ban Type</th>
                <th scope="col">Ban Reason</th>
                <th scope="col">Ban Message</th>
                <th scope="col">Ban Date</th>
                <th scope="col">Banned Until</th>
                <th scope="col">Ban Duration</th>
                </tr>
            </thead>
            <tbody>
            {users?.map((req: IBanUserInfo, index: number) => (
                <tr key={req.id}>
                    {
                    <>
                    <td>{userEmail[index]}</td>
                    <td>{userFirstName[index]}</td>
                    <td>{userLastName[index]}</td>
                    <td>{userType[index]}</td>
                    <td>{banType[index]}</td>
                    <td>{banReason[index]}</td>
                    <td>{banMessage[index]}</td>
                    <td>{(new Date(banDate[index]).toLocaleDateString())}</td>
                    <td>{(new Date(banEndDate[index])).toLocaleDateString()}</td>
                    <td>{banDuration[index]}</td>
                    </>
                }
                </tr>
                ))}
            </tbody>
            </Table>
        </Form>
        <br></br>
        </Container>
        );
}