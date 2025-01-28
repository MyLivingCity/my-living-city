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
import OrganizationCard from './OrganizationCardSegment';
import StandardProfileForm from './StandardProfileForm';
import { postUserSegmentRequest } from 'src/lib/api/userSegmentRequestRoutes';
import { API_BASE_URL, TEXT_INPUT_LIMIT, USER_TYPES } from 'src/lib/constants';
import { IUser } from '../../../lib/types/data/user.type';
import { capitalizeString } from '../../../lib/utilityFunctions';
import { RequestSegmentModal } from '../../partials/RequestSegmentModal';
import StripeCheckoutButton from 'src/components/partials/StripeCheckoutButton';
import {
    getSchoolSegmentDetails,
    getUserSubscriptionStatus,
    getWorkSegmentDetails,
} from 'src/lib/api/userRoutes';
import {
    LinkType,
    PublicStandardProfile,
    PublicCommunityBusinessProfile,
    PublicMunicipalProfile,
} from 'src/lib/types/data/publicProfile.type';
import {
    getCommunityBusinessProfile,
    updateCommunityBusinessProfile,
    getCommunityBusinessLinks,
    getMunicipalProfile,
    getStandardProfile,
    updateStandardProfile,
    updateMunicipalProfile,
    getMunicipalLinks,
} from 'src/lib/api/publicProfileRoutes';
import { SegmentInfo } from '../../partials/ProfileContent/SegmentInfo';
import {
    deleteSchoolSegmentDetails,
    deleteWorkSegmentDetails,
    updateSchoolSegmentDetails,
    updateWorkSegmentDetails,
    updateHomeSegmentDetails,
    getUserGeoData,
} from 'src/lib/api/userRoutes';
import { getAllSegments } from 'src/lib/api/segmentRoutes';
import { patchUserSegment } from 'src/lib/api/userSegmentRoutes';
import { BsFileBreakFill } from 'react-icons/bs';



interface ProfileContentProps {
    user: IUser;
    token: string;
    showAdminAccessLevel:boolean;
    isOrganization:boolean;
}

const UNKNOWN = '';
const NOT_SELECTED = 'Not Selected';

const LinkTypes = Object.keys(LinkType).filter((item) => {
    return isNaN(Number(item));
});


const deleteSegmentDetail = async (user: string | undefined, segment: string | undefined) => {
    if(user === undefined || segment === undefined) {return;};

    segment = segment.toLowerCase();
    
    const map:Record<string, (user: string) => Promise<void>> = {
        work: deleteWorkSegmentDetails,
        school: deleteSchoolSegmentDetails,
     
    }

    const deleteFunction = map[segment];

    if(!deleteFunction){
        console.error("Invalid segment type:", segment);
    }

    await deleteFunction;
}

const updateSegmentDetail = async(user:string | undefined, segment:string | undefined, data: any) => {
    if(user === undefined || segment === undefined) {
        console.log("user or segment is undefined");
        return;
    }
    
    segment = segment.toLowerCase();

    const segmentHandle = `${data.displayFName}@${data.displayLName}`;

    const segmentKeyMap: Record<string, string> = {
        work: "workSegHandle",
        school: "schoolSegHandle",
        home: "homeSegHandle",
    };

    const segmentUpdateMap: Record<string, (user: string, data: any) => Promise<void>> = {
        work: updateWorkSegmentDetails,
        school: updateSchoolSegmentDetails,
        home: updateHomeSegmentDetails,
    };

    const patchKey = segmentKeyMap[segment];
    const updateFunction = segmentUpdateMap[segment];

    if (!patchKey || !updateFunction) {
        console.error("Invalid segment type:", segment);
    }

    const patchPayload = { [patchKey]: segmentHandle };

    await patchUserSegment(user, patchPayload);

    await updateFunction(user, data);
}

const ProfileContentGeneric: React.FC<ProfileContentProps> = ({ user, token, showAdminAccessLevel = false, isOrganization = false}) => {
    if(user === null){
        //return <ErorrPage/>
    }

    if(token === null){
        //return <ErrorPage/>
    }

     const {
            email,
            adminmodEmail,
            userType,
            organizationName,
            fname,
            lname,
            address,
            userSegments,
            imagePath,
            displayFName,
            displayLName,
            createdAt
        } = user;
    
        const { streetAddress, streetAddress2, city, postalCode, country } = address!;
        const [show, setShow] = useState(false);
        const [stripeStatus, setStripeStatus] = useState('');
        const [segmentRequests, setSegmentRequests] = useState<any[]>([]);
        const [communityBusinessProfile, setCommunityBusinessProfile] = useState<any>(
            {}
        );
        const [municipalProfile, setMunicipalProfile] = useState<any>({});
        const [standardProfile, setStandardProfile] = useState<any>({});
        const [links, setLinks] = useState<any[]>([]);
        const [showAlert, setShowAlert] = useState(false);
        const [workData, setWorkData] = useState<any>({});
        const [schoolData, setSchoolData] = useState<any>({});
        const [geoData, setGeoData] = useState<any>({});
        const [segments, setSegments] = useState<any[]>([]);
        const [subSegments, setSubSegments] = useState<any[]>([]);
        const [editPersonalInfo, setEditPersonalInfo] = useState(false);
        const [showWorkSegment, setShowWorkSegment] = useState(!!userSegments?.workSegmentName);
        const [showSchoolSegment, setShowSchoolSegment] = useState(!!userSegments?.schoolSegmentName);
        const [editHomeSegment, setEditHomeSegment] = useState(false);
        const [editWorkSegment, setEditWorkSegment] = useState(false);
        const [editSchoolSegment, setEditSchoolSegment] = useState(false);
    
        function handleEditPersonalInfo() {
            setEditPersonalInfo(!editPersonalInfo);
        }
    
        function addNewRow() {
            let table = document.getElementById('formLinksBody');
            let rowCount = table?.childElementCount;
            setLinks([
                ...links,
                { linkType: LinkType.WEBSITE, link: '', index: rowCount },
            ]);
        }
    
        useEffect(() => {
            getUserSubscriptionStatus(user.id)
                .then((e) => setStripeStatus(e.status))
                .catch((e) => console.log(e));
            if (segmentRequests.length > 0) {
                postUserSegmentRequest(segmentRequests, token);
            }
        }, [segmentRequests]);
    
        useEffect(() => {
            getCommunityBusinessProfile(user.id, token)
                .then((e) => setCommunityBusinessProfile(e))
                .catch((e) => console.log(e));
        }, []);
    
        useEffect(() => {
            if (communityBusinessProfile.id) {
                getCommunityBusinessLinks(communityBusinessProfile.id, token)
                    .then((e) => setLinks(e))
                    .catch((e) => console.log(e));
            }
        }, [communityBusinessProfile, token]);
    
        useEffect(() => {
            getMunicipalProfile(user.id, token)
                .then((e) => setMunicipalProfile(e))
                .catch((e) => console.log(e));
        }, []);
    
        useEffect(() => {
            if (municipalProfile.id) {
                getMunicipalLinks(municipalProfile.id, token)
                    .then((e) => setLinks(e))
                    .catch((e) => console.log(e));
            }
        }, [municipalProfile, token]);
    
        useEffect(() => {
            getStandardProfile(user.id, token)
                .then((e) => setStandardProfile(e))
                .catch((e) => console.log(e));
        }, []);
    
        useEffect(() => {
            getWorkSegmentDetails(user.id)
                .then((e) => setWorkData(e))
                .catch((e) => console.log(e));
        }, []);
    
        useEffect(() => {
            getSchoolSegmentDetails(user.id)
                .then((e) => setSchoolData(e))
                .catch((e) => console.log(e));
        }, []);
    
        useEffect(() => {
            getUserGeoData(user.id)
                .then((e) => setGeoData(e))
                .catch((e) => console.log(e));
        }, []);
    
        useEffect(() => {
            getAllSegments()
                .then((e) => setSegments(e))
                .catch((e) => console.log(e));
        }, []);
    
        const updateLink = (linkValue: string, link: any) => {
            const linksCopy = [...links];
            const index = linksCopy.indexOf(link);
            linksCopy[index].link = linkValue;
            setLinks(linksCopy);
        };
    
        const updateLinkType = (linkTypeValue: string, link: any) => {
            const linksCopy = [...links];
            const index = linksCopy.indexOf(link);
            linksCopy[index].linkType = linkTypeValue;
            setLinks(linksCopy);
        };
    
        // Removes the row based on the index provided
        const deleteRow = (link: any) => {
            const linkLocation = document.getElementById('formLinksBody');
            const linkRow = linkLocation?.getElementsByTagName('tr');
            if (linkRow) {
                for (let i = 0; i < linkRow.length; i++) {
                    if (
                        linkRow[i]
                            .getElementsByTagName('td')[0]
                            .getElementsByTagName('select')[0].value === link.linkType &&
                        linkRow[i]
                            .getElementsByTagName('td')[1]
                            .getElementsByTagName('input')[0].value === link.link
                    ) {
                        linkRow[i].remove();
                    }
                }
            }
        };


        const workSegment = () =>{
            return(
                <Row className='mt-3'>
                    {showWorkSegment ? Object.keys(workData).length > 0 && (
                        <SegmentInfo
                            user={user!}
                            token={token!}
                            title={'Business Segment'}
                            type={'work'}
                            segmentData={{
                                segmentId: userSegments?.workSegmentId ? userSegments?.workSegmentId : 0,
                                segmentHandle: userSegments?.workSegHandle ?? '',
                                street: workData!.streetAddress ? workData!.streetAddress : UNKNOWN,
                                city: userSegments?.workSegmentName ? userSegments?.workSegmentName : NOT_SELECTED,
                                postalCode: workData!.postalCode ? workData!.postalCode : UNKNOWN,
                                neighborhood: userSegments?.workSubSegmentName ? userSegments?.workSubSegmentName : NOT_SELECTED,
                            }}
                            geoData={{
                                lat: geoData!.work_lat ? geoData!.work_lat : 0,
                                lon: geoData!.work_lon ? geoData!.work_lon : 0,
                            }}
                            segments={segments!}
                            edit={editWorkSegment}
                            setEdit={setEditWorkSegment}
                            deleteFunction={deleteSegmentDetail}
                            updateFunction={updateSegmentDetail}
                        ></SegmentInfo>
                    ) : (
                        <Button variant='primary' onClick={() => { setShowWorkSegment(true); setEditWorkSegment(true); }}>Add Work Segment</Button>
                    )}
                </Row>
            )
        }

        const homeSegment = () =>{
            return(
                <Row>
                    <SegmentInfo
                        user={user!}
                        token={token!}
                        title={'Residence Segment'}
                        type={'home'}
                        segmentData={{
                            segmentId: userSegments?.homeSegmentId ? userSegments?.homeSegmentId : 0,
                            segmentHandle: userSegments?.homeSegHandle ?? '',
                            street: streetAddress ? streetAddress : UNKNOWN,
                            city: userSegments?.homeSegmentName ? userSegments?.homeSegmentName : NOT_SELECTED,
                            postalCode: postalCode ? postalCode : UNKNOWN,
                            neighborhood: userSegments?.homeSubSegmentName ? userSegments?.homeSubSegmentName : NOT_SELECTED,
                        }}
                        geoData={{
                            lat: geoData!.lat ? geoData!.lat : 0,
                            lon: geoData!.lon ? geoData!.lon : 0,
                        }}
                        segments={segments!}
                        edit={editHomeSegment}
                        setEdit={setEditHomeSegment}
                        updateFunction={updateSegmentDetail}
                    ></SegmentInfo>
                </Row>
            )
        }

        const schoolSegment = () =>{
            return(
                <Row className='mt-3'>
                    {showSchoolSegment ? Object.keys(schoolData).length > 0 && (
                        <SegmentInfo
                            user={user!}
                            token={token!}
                            title={'School Segment'}
                            type={'school'}
                            segmentData={{
                                segmentId: userSegments?.schoolSegmentId ? userSegments?.schoolSegmentId : 0,
                                segmentHandle: userSegments?.schoolSegHandle ?? '',
                                street: schoolData!.streetAddress ? schoolData!.streetAddress : UNKNOWN,
                                city: userSegments?.schoolSegmentName ? userSegments?.schoolSegmentName : NOT_SELECTED,
                                postalCode: schoolData!.postalCode ? schoolData!.postalCode : UNKNOWN,
                                neighborhood: userSegments?.schoolSubSegmentName ? userSegments?.schoolSubSegmentName : NOT_SELECTED,
                            }}
                            geoData={{
                                lat: geoData!.school_lat ? geoData!.school_lat : 0,
                                lon: geoData!.school_lon ? geoData!.school_lon : 0,
                            }}
                            segments={segments!}
                            edit={editSchoolSegment}
                            setEdit={setEditSchoolSegment}
                            deleteFunction={deleteSegmentDetail}
                            updateFunction={updateSegmentDetail}
                        ></SegmentInfo>
                    ) : (
                        <Button variant='primary' onClick={() => { setShowSchoolSegment(true); setEditSchoolSegment(true); }}>Add School Segment</Button>
                    )}
                </Row>
            )
        }

        


    const handleStandardProfile = () => {
        const id = user.id;
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
            email: email,
            fname: firstName,
            lname: lastName,
        };
        const test = updateStandardProfile(profileNew, token)
            .then((e) => console.log(e))
            .catch((e) => console.log(e));
        setShowAlert(true);
        return {
            firstName: firstName,
            lastName: lastName,
            email: email,
        };
    };

    const images = () => {
        return (
            <Col>
                {imagePath ? (
                    <Image
                        fluid
                        src={imagePath}
                        style={{
                            objectFit: 'cover',
                            height: '200px',
                            width: '200px',
                        }}
                        roundedCircle
                    />
                ) : (
                    <Image
                        fluid
                        src='https://ih1.redbubble.net/image.785212781.7855/st,small,507x507-pad,600x600,f8f8f8.jpg'
                        width='70%'
                        roundedCircle
                    />
                )}
            </Col>
        )
    }

    const displayName = () => {
        return(
            <Card.Title className='mt-3'>
                {fname ? capitalizeString(fname) : 'Unknown'}{' '}
                {lname ? capitalizeString(lname) : 'Unknown'}
            </Card.Title>
        )
    }
        

    return(
        <Container className='user-profile-content w-100'>
            <Row className='mb-4 mt-4 justify-content-center'>
                <h2 className='pb-2 pt-2 display-6'>User Profile</h2>
            </Row>
            <Row style={{ marginBottom: '2rem' }}>
                <Card className='text-center mx-5 mb-5' style={{ width: '18rem' }}>

                    <Row className='mt-3'>
                        {images()}
                    </Row>

                    {(!isOrganization) ? (displayName()) : null}

                    <Card.Text className='mb-3'>{email}</Card.Text>
                    {stripeStatus !== '' && (
                        <>
                            <p>
                                Subscription Status:{' '}
                                {stripeStatus === 'active' ? 'Active' : 'Not Active'}
                            </p>
                            <StripeCheckoutButton status={stripeStatus} user={user} />
                        </>
                    )}
                </Card>
                
                {(isOrganization) ? (<OrganizationCard streetAddress2={streetAddress2} organizationName={organizationName} email={email} streetAddress={streetAddress} postalCode={postalCode} city={city} homeSegmentName={userSegments!.homeSegmentName}/>) : null}


                <Card
                    style={{
                        width: '42rem',
                        padding: '1.5rem',
                        paddingBottom: '0',
                        paddingTop: '0',
                        justifyContent: 'center',
                    }}
                >
                    {showAlert ? (
                        <Alert
                            variant='primary'
                            dismissible
                            onClose={() => setShowAlert(false)}
                        >
                            Profile Updated
                        </Alert>
                    ) : null}
                    <Row>
                        <Col style={{ maxWidth: '4rem' }}></Col>
                        {editPersonalInfo ? (
                            <StandardProfileForm token={token} id={user.id} email={user.email} fName={user.fname} lName={user.lname}/>
                        ) : (
                            <>
                                <Col style={{ padding: '0', maxWidth: '15rem' }}>
                                    <ListGroup variant='flush'>
                                        <ListGroupItem>
                                            <strong>Full Name: </strong>
                                        </ListGroupItem>
                                        <ListGroupItem>
                                            <strong>Email: </strong>
                                        </ListGroupItem>
                                        <ListGroupItem>
                                            <strong>User Type: </strong>
                                        </ListGroupItem>
                                        <ListGroupItem>
                                            <strong>Creation Date: </strong>
                                        </ListGroupItem>

                                        //CONDITIONAL 



                                        <ListGroupItem>
                                            <strong>Community Request: </strong>
                                        </ListGroupItem>
                                    </ListGroup>
                                </Col>
                                <Col style={{ padding: '0' }}>
                                    <ListGroup variant='flush'>
                                        <ListGroupItem>
                                            {capitalizeString(fname!)} {capitalizeString(lname!)}




                                            //CHANGEABLE




                                        </ListGroupItem>
                                        <ListGroupItem>{email!}</ListGroupItem>
                                        <ListGroupItem>{userType!}</ListGroupItem>
                                        <ListGroupItem>{new Date(createdAt!).toISOString().split('T')[0]}</ListGroupItem>
                                        <ListGroup.Item>
                                            <Button
                                                variant='link'
                                                style={{ padding: '0' }}
                                                onClick={() => setShow((b) => !b)}
                                            >
                                                Request your Community!
                                            </Button>
                                        </ListGroup.Item>
                                    </ListGroup>
                                </Col>
                                <Col style={{ maxWidth: '8rem' }}>
                                    <Button
                                        variant='primary'
                                        className=''
                                        onClick={handleEditPersonalInfo}
                                        style={{ float: 'right', marginTop: '10px' }}
                                    >
                                        Edit
                                    </Button>
                                </Col>
                            </>
                        )}
                    </Row>
                    <RequestSegmentModal
                        showModal={show}
                        setShowModal={setShow}
                        index={0}
                        setSegmentRequests={setSegmentRequests}
                        segmentRequests={segmentRequests}
                    />
                </Card>
            </Row>


            {homeSegment()}

            {workSegment()}

            {schoolSegment()}


        </Container>
    )
}


export default ProfileContentGeneric;