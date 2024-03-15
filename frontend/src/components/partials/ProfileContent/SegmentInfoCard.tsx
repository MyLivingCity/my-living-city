import React, { useEffect, useState } from 'react';
import { Col, Row, Card, ListGroup, ListGroupItem, Button, Form} from 'react-bootstrap';
import { IUser } from '../../../lib/types/data/user.type';
import { capitalizeString } from '../../../lib/utilityFunctions';
import Modal from 'react-bootstrap/Modal';
import SimpleMap from 'src/components/map/SimpleMap';
import { getAllSubSegmentsWithId, getSegmentByName } from 'src/lib/api/segmentRoutes';
import { ISegment } from 'src/lib/types/data/segment.type';
import { ISubSegment } from 'src/lib/types/data/segment.type';
import { get } from 'jquery';
import { getMyUserSegmentInfo } from 'src/lib/api/userSegmentRoutes';

interface SegmentInfoCardProps {
  user: IUser;
  token: string;
  title: string;
  type: string;
  segmentData: SegmentData;
  geoData: any;
  segments: ISegment[];
  deleteFunction?: (user: string | undefined) => void;
  updateFunction?: (user: string | undefined, data: any) => Promise<void>;
}

interface SegmentData {
  displayFName: string;
  displayLName: string;
  street: string;
  municipality: string;
  postalCode: string;
  neighborhood: string;
}

interface SelectOption {
  value: string;
  label: string;
}

const DEFAULT_MUNICIPALITY = { value: '', label: 'Select Municipality'};
const DEFAULT_Neighborhood = { value: '', label: 'Select Neighborhood'};

export const SegmentInfoCard = ({
  user,
  token,
  title,
  type,
  segmentData,
  geoData,
  segments,
  deleteFunction,
  updateFunction,
}: SegmentInfoCardProps) => {
  const [displayFName, setDisplayFName] = useState(segmentData?.displayFName);
  const [displayLName, setDisplayLName] = useState(segmentData?.displayLName);
  const [street, setStreet] = useState(segmentData?.street);
  const [postalCode, setPostalCode] = useState(segmentData?.postalCode);

  const [segmentOptions, setSegmentOptions] = useState<SelectOption[]>([]);
  const [subSegmentOptions, setSubSegmentOptions] = useState<SelectOption[]>([]);
  const [municipality, setMunicipality] = useState(segmentData?.municipality);
  const [neighborhood, setNeighborhood] = useState(segmentData?.neighborhood);

  // When segment is changed, get the subsegments for that segment
  const handleSegmentChange = (
    option: string,
    SetSegment: (value: React.SetStateAction<string>) => void,
    SetSubSegment: (value: React.SetStateAction<ISubSegment[]>) => void,
    SetSubSegmentOptions: (value: React.SetStateAction<SelectOption[]>) => void,
    clearSubSegment?: boolean
  ) => {
    SetSegment(option);
    if (option && option !== '') {
      getAllSubSegmentsWithId(option).then((res) => {
        if (res) {
          const subSegOptions = res.map((subSeg) => ({ value: subSeg.id.toString(), label: subSeg.name }));
          SetSubSegmentOptions(subSegOptions);
        }
      });
    } else {
      SetSubSegmentOptions([]); 
    }
    if (clearSubSegment) {
      SetSubSegment([]);
    }
  }

  const [subSegments, setSubSegments] = useState<ISubSegment[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<string>('');
  const [selectedSubSegment, setSelectedSubSegment] = useState<string>('');
  const handleSugSemgnetChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubSegment(event.target.value);
  }

  const handleClearSegmentInfo = () => {
    setSelectedSegment('');
    setSelectedSubSegment('');
    setSegmentOptions([]);
    setSubSegmentOptions([]);
  }

  const handSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    updateFunction && await updateFunction?.(user.id, data);
  }

  // get the segment data for the user

}