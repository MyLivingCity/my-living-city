import React from 'react'
import {Table, Form, Button, Col, Container, Row, Card, Alert } from 'react-bootstrap';
import {useState} from 'react'
import {ISegment, ISubSegment} from '../../lib/types/data/segment.type';
import { IFetchError } from '../../lib/types/types';
import { capitalizeString } from '../../lib/utilityFunctions';
import {createSegment, createSubSegment, updateSegment, updateSubSegment} from '../../lib/api/segmentRoutes';
import {useAllSubSegmentsWithId} from '../../hooks/segmentHooks';
import { ShowSubSegmentsPage } from 'src/pages/ShowSubSegmentsPage';
//import {Image} from 'react-native';

export interface ShowSubSegmentsProps {
  segId: number;
  token: any;
  segName: string | null | undefined;
  data?: ISubSegment[] | undefined;
}
export const ShowSubSegments:React.FC<ShowSubSegmentsProps> = ({data, segId, segName, token}) => {
  // const {data} = useAllSubSegmentsWithId(String(segId!));
  const [showNewSubSeg, setShowNewSubSeg] = useState(false);
  const [error, setError] = useState<IFetchError | null>(null);
  let createData = {} as ISubSegment;
  const handleSubSegSubmit = async(updateData?: any) => {
    try{
      if(updateData){
        if(!updateData.name){
          setError(Error("Please enter a sub-segment name when updating"));
          throw error;
        }
        if(!updateData.lat || !updateData.lon){
          setError(Error("Please enter lat and lon when updating sub-segment"));
          throw error;
        }
        await updateSubSegment(updateData, token);
      }else{
        if(!createData.name){
          setError(Error("Please enter a name when creating a sub-segment"));
          throw error;
        }
        if(!createData.lat || !createData.lon){
          setError(Error("Please enter a lat and long when creating a segment"));
          throw error;
        }
        if(data){
          const found = data!.find(element => element.name === createData.name)
          if(found){
            setError(Error("A Sub-segment with this name already exists"));
            throw error;
          }
        }

          createData.segId = segId;
          await createSubSegment(createData,token);

      }
      setShowNewSubSeg(false);
      setError(null);
    }catch(error){
      console.log(error);
      setShowNewSubSeg(false);
    }
  }
    return(
      <Card>
      {/* <img alt=""src={"http://localhost:3001/static/uploads/1621449457193-SampleAds1.png"} /> */}
      <Card.Header>{capitalizeString(segName!)} Sub-Segments <Button className="float-right" size="sm" onClick={(e)=>{setShowNewSubSeg(true)}}>Add New Sub-Segments</Button></Card.Header>
      <Card.Body>
          <Table bordered hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Lat</th>
                <th>Lon</th>
                <th>Controls</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((segment: ISubSegment) => (
              <tr key={segment.id}>
                {/* <td><Form.Control type="text" value={String(segment.segId)} readOnly/></td> */}
                <td><Form.Control 
                  type="text" 
                  defaultValue={capitalizeString(segment.name)}
                  onChange={(e)=>{segment.name = e.target.value}}
                  /></td>
                  <td><Form.Control 
                  type="text" 
                  defaultValue={segment.lat}
                  onChange={(e)=>{segment.lat = parseFloat(e.target.value)}}
                  /></td>
                  <td><Form.Control 
                  type="text" 
                  defaultValue={segment.lon}
                  onChange={(e)=>{segment.lon = parseFloat(e.target.value)}}
                  /></td>
                <td>
                  <Button onClick={()=>handleSubSegSubmit({name:segment.name, lat: segment.lat, lon: segment.lon, id:segment.id})}size="sm">Update</Button>{' '}
                </td>
              </tr>))}
              {showNewSubSeg && 
              <tr>
              <td><Form.Control type="text" onChange={(e)=>createData.name = e.target.value}></Form.Control></td>
              <td><Form.Control type="text" onChange={(e)=>createData.lat = parseFloat(e.target.value)}></Form.Control></td>
              <td><Form.Control type="text" onChange={(e)=>createData.lon = parseFloat(e.target.value)}></Form.Control></td>
              <td><Button type="submit" size="sm" onClick={()=>{handleSubSegSubmit()}}>Add Sub-Segment</Button> </td>
              </tr>
              }
            </tbody>
          </Table>
          {error && (
              <Alert variant='danger' className="error-alert">
                { error.message}
              </Alert>
            )}
        </Card.Body>
      </Card>
    )
}

interface ShowSegmentsProps {
  segments: ISegment[] | undefined;
  token: string;
}
//NOTES
//Currently requesting all segments from the database. In future only request the segments that are needed.
//Segments are filtered on the front-end by country/province. Will need to query by these params to limit the amount of segments returned.
//Only handling Canadian Provinces, will need to be able to add other countries as well in the future.
export const ShowSegments: React.FC<ShowSegmentsProps> = ({segments, token}) => {
  const provinces: string[] = ['British Columbia', 'Alberta', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon']
  const countries: string[] = ['Canada'];
  const [showNewSeg, setShowNewSeg] = useState(false);
  const [segId, setSegId] = useState<number | null>(null);
  const[segName, setSegName] = useState<string | null>(null);
  const [error, setError] = useState<IFetchError | null>(null);
  const [showSub, setShowSub] = useState(false);
  const[provName, setProvName] = useState(provinces[0].toLowerCase());
  const[countryName, setCountryName] = useState(countries[0].toLowerCase());
  const filteredSegments = segments!.filter(segment => segment.province === provName && segment.country === countryName)
  let createData = {} as ISegment;
  const handleSegSubmit = async(updateData?: any) => {
  try{
    if(updateData){
      if(!updateData.name){
        setError(Error("Please enter a segment name when updating"));
        throw error;
      }
      await updateSegment(updateData, token);
    }else{
      if(!createData.name){
        setError(Error("Please enter a name when creating a segment"));
        throw error;
      }
      const found = segments!.find(element => element.name === createData.name)
      if(found){
        setError(Error("A Sub-segment with this name already exists"));
        throw error;
      }
      createData.country = countryName;
      createData.province = provName;
      await createSegment(createData,token);
    }
    setShowNewSeg(false);
    setError(null);
    window.location.reload();
  }catch(error){
    console.log(error);
  }
}
    return (
      <>
      <Row>
      <Col md="auto">
      <Form.Group>
      <Card>
        <Card.Header>Enter a location to manage</Card.Header>
        <Card.Body>
          <Form.Label>Country</Form.Label>
          <Form.Control 
            size="sm" 
            as="select"
            name="country"
            onChange={(e)=>{
              setCountryName((e.target.value).toLowerCase());
              setShowSub(false);
              setShowNewSeg(false);
              }}>
            {countries.map(country => <option>{country}</option>)}
          </Form.Control>
            <br />
          <Form.Label>Province</Form.Label>
            <Form.Control 
            size="sm" 
            as="select"
            name="prov"
            onChange={(e)=>{
              setProvName((e.target.value).toLowerCase());
              setShowSub(false);
              setShowNewSeg(false);
              }}>
            {provinces.map(prov => <option>{prov}</option>)}
          </Form.Control>
        </Card.Body>
      </Card>
      </Form.Group>
      </Col>
      <Col>
      <Card>
      <Card.Header>{capitalizeString(provName!)} segments <Button className="float-right"size="sm"onClick={(e)=>{setShowNewSeg(true)}}>Create New Segment</Button></Card.Header>
        <Card.Body>
          <Table bordered hover>
            <thead>
              <tr>
                {/* <th>Seg ID</th> */}
                <th>Segment Name</th>
                <th>Super Seg-Name</th>
                <th>Controls</th>
              </tr>
            </thead>
            <tbody>
              {filteredSegments?.map(segment => (
                <tr key={segment.segId}>
                <td><Form.Control
                  type="text" 
                  defaultValue={capitalizeString(segment.name)}
                  onChange={(e)=>{segment.name = e.target.value}}
                  /></td>
                <td><Form.Control 
                  type="text" defaultValue={segment.superSegName!}
                  onChange={(e)=>{segment.superSegName = e.target.value}}
                  /></td>
                <td>
                  <Button onClick={()=>{
                    // updateSegment({name:segment.name.toLowerCase(),superSegName:segment.superSegName?.toLowerCase(), segId:segment.segId}, token);
                    // createData.segId = segment.segId;
                    handleSegSubmit({country: countryName, province: provName, name:segment.name.toLowerCase(),superSegName:segment.superSegName?.toLowerCase(), segId:segment.segId});
                    }}size="sm">Update</Button>{' '}
                    <Button variant="outline-primary" onClick={()=>{
                    setSegId(segment.segId);
                    setSegName(segment.name);
                    setShowNewSeg(false);
                    setShowSub(true);
                    }} size="sm">View Sub-Segs</Button>
                </td>
              </tr>)
              )
            }
              {showNewSeg && 
              <tr>
              <td><Form.Control type="text" onChange={(e)=>createData.name = e.target.value.toLowerCase()}></Form.Control></td>
              <td><Form.Control type="text" onChange={(e)=>createData.superSegName = e.target.value.toLowerCase()}></Form.Control></td>
              <td><Button type="submit" size="sm" onClick={()=>{handleSegSubmit()}}>Add Segment</Button> </td>
              </tr>
              }
            </tbody>
          </Table>
          {error && (
              <Alert variant='danger' className="error-alert">
                { error.message}
              </Alert>
            )}
        </Card.Body>
      </Card>
      <br/>
      {(showSub && segId) &&
        <ShowSubSegmentsPage segId={segId} segName={segName}token={token}/>
    }

      </Col>
      
      </Row>
      
    </>
    );
}

interface SegmentPageContentProps {
  segments: ISegment[] | undefined;
  token: any;
}
//Country isnt reflected in the form data, need to implement when more countries are being used.
//Enter location to manage only checks for the segments with the province name selected.
//Passing all the segments to the segmentmanagementContent component, in the future only get the api data that is needed.
const SegmentManagementContent: React.FC<SegmentPageContentProps> = ({segments, token}) => {
  return (
    <Container className='conversations-page-content'>
      <h2 className="pb-2 pt-2 display-6">Segmentation Manager</h2>
          <ShowSegments segments={segments} token={token}/>
    </Container>
  );
}

export default SegmentManagementContent;