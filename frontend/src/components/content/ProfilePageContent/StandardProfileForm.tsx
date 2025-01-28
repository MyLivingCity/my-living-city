import React, { useEffect, useState } from 'react';

import {
    Col,
    Container,
    Row,
    Card,
    Image,
    ListGroup,
    ListGroupItem,
    Button,
    Form,
    Table,
    NavDropdown,
    Dropdown,
    Alert,
} from 'react-bootstrap';

import {updateStandardProfile} from 'src/lib/api/publicProfileRoutes';
import { TEXT_INPUT_LIMIT } from 'src/lib/constants';
import {PublicStandardProfile} from 'src/lib/types/data/publicProfile.type';

type SPFProps = {
    token : string,
    id: string,
    email: string,
    fName: string | undefined,
    lName: string | undefined,
}

function StandardProfileForm(props : SPFProps){

    function handleEditPersonalInfo() {
        setEditPersonalInfo(!editPersonalInfo);
    }
    
    const [showAlert, setShowAlert] = useState(false);
    const [editPersonalInfo, setEditPersonalInfo] = useState(false);
    const [standardProfile, setStandardProfile] = useState<any>({});

    const handleStandardProfile = () => {
        const id = props.id;
        const firstName = (
            document.getElementById('formStandardFirstName') as HTMLInputElement
        ).value;
        const lastName = (
            document.getElementById('formStandardLastName') as HTMLInputElement
        ).value;
        const email = (
            document.getElementById('formStandardEmail') as HTMLInputElement
        ).value;
        const profileNew: PublicStandardProfile = {
            id: id,
            email: props.email,
            fname: props.fName!,
            lname: props.lName!
        };
        const test = updateStandardProfile(profileNew, props.token)
            .then((e) => console.log(e))
            .catch((e) => console.log(e));
        setShowAlert(true);
        return {
            firstName: firstName,
            lastName: lastName,
            email: email,
        };
    };  


    return(
        <Form
        id='formPublicProfile'
        style={{ minWidth: '20rem' }}
        onSubmit={(e) => {
            e.preventDefault();
            handleStandardProfile();
            setEditPersonalInfo(false);
            // Change
            window.location.reload();
        }}
        >
        <Form.Group
            className='mb-3'
            controlId='formProfileInformation'
        >
            {standardProfile ? (
                <>
                    <Form.Group className='mb-3' controlId='firstName'>
                        <Form.Label>
                            <strong>First Name:</strong>
                        </Form.Label>
                        <Form.Control
                            type='text'
                            id='formStandardFirstName'
                            placeholder='First Name'
                            defaultValue={props.fName}
                            maxLength={TEXT_INPUT_LIMIT.NAME}
                        />
                    </Form.Group>
                    <Form.Group className='mb-3' controlId='lastName'>
                        <Form.Label>
                            <strong>Last Name:</strong>
                        </Form.Label>
                        <Form.Control
                            type='text'
                            id='formStandardLastName'
                            placeholder='Last Name'
                            defaultValue={props.lName}
                            maxLength={TEXT_INPUT_LIMIT.NAME}
                        />
                    </Form.Group>
                    <Form.Group className='mb-3' controlId='email'>
                        <Form.Label>
                            <strong>Email:</strong>
                        </Form.Label>
                        <Form.Control
                            type='email'
                            id='formStandardEmail'
                            placeholder='Email Address'
                            defaultValue={props.email}
                        />
                    </Form.Group>
                </>
            ) : null}
            <Button
                variant='danger'
                className='btn-sm'
                style={{ marginRight: '1rem' }}
                onClick={handleEditPersonalInfo}
            >
                Cancel
            </Button>
            <Button variant='primary' className='btn-sm' type='submit'>
                Update
            </Button>
        </Form.Group>
        </Form>
    )
}

export default StandardProfileForm;