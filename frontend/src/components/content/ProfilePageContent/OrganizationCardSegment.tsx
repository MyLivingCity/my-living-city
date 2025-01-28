import React, { useEffect, useState } from 'react';
import {
    Row,
    Card,
    ListGroup,
} from 'react-bootstrap';
import { capitalizeString } from '../../../lib/utilityFunctions';
import { RequestSegmentModal } from '../../partials/RequestSegmentModal';


type organizationProps = {
    streetAddress2: string | undefined,
    organizationName: string | undefined,
    email: string | undefined,
    streetAddress: string | undefined,
    postalCode: string | undefined,
    city: string | undefined,
    homeSegmentName: string | undefined,
}

function OrganizationCard(props:organizationProps){
    const [show, setShow] = useState(false);
    const [segmentRequests, setSegmentRequests] = useState<any[]>([]);
    return(
        <Card style={{ width: '40rem' }}>
            <Row className='justify-content-center mt-3'>
                <ListGroup variant='flush' className=''>
                    <ListGroup.Item>
                        <strong>Organization Name</strong>
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <strong>Email</strong>
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <strong>Street Address</strong>
                    </ListGroup.Item>
                    {props.streetAddress2 ? (
                        <ListGroup.Item>
                            <strong>Street Address 2</strong>
                        </ListGroup.Item>
                    ) : null}
                    <ListGroup.Item>
                        <strong>City</strong>
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <strong>Postal Code / Zip</strong>
                    </ListGroup.Item>
                </ListGroup>

                <ListGroup variant='flush' className=''>
                    <ListGroup.Item>
                        {props.organizationName
                            ? capitalizeString(props.organizationName)
                            : 'Unknown'}{' '}
                    </ListGroup.Item>
                    <ListGroup.Item>{props.email}</ListGroup.Item>
                    <ListGroup.Item>
                        {props.streetAddress ? capitalizeString(props.streetAddress) : 'Unknown'}
                    </ListGroup.Item>
                    {props.streetAddress2 ? (
                        <ListGroup.Item>
                            {props.streetAddress2
                                ? capitalizeString(props.streetAddress2)
                                : 'Unknown'}
                        </ListGroup.Item>
                    ) : null}
                    <ListGroup.Item>
                        {props.city
                            ? capitalizeString(props.city)
                            : capitalizeString(props.homeSegmentName)}
                    </ListGroup.Item>
                    <ListGroup.Item>
                        {props.postalCode ? props.postalCode.toUpperCase() : 'Unknown'}
                    </ListGroup.Item>
                </ListGroup>
                <RequestSegmentModal
                    showModal={show}
                    setShowModal={setShow}
                    index={0}
                    setSegmentRequests={setSegmentRequests}
                    segmentRequests={segmentRequests}
                />
            </Row>
        </Card>
    )
}

export default OrganizationCard;