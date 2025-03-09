import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { ISegment, ISegmentRequest, ISuperSegment } from '../../lib/types/data/segment.type';
import ShowSubSegments from './ShowSubSegments';
import SegmentTable from './SegmentTable';
import LocationSelector from './LocationSelector';
import SuperSegmentsTable from './SuperSegmentsTable';

interface SegmentPageContentProps {
    segments: ISegment[] | undefined;
    token: string;
    segReq: ISegmentRequest[] | undefined;
}

const SegmentManagementContent: React.FC<SegmentPageContentProps> = ({
    segments: segs,
    token,
    segReq,
}) => {
    const [segments, setSegments] = useState<ISegment[]>(segs || []);
    const [superSegments, setSuperSegments] = useState<ISuperSegment[]>([]);
    const [countryName, setCountryName] = useState<string>('');
    const [provName, setProvName] = useState<string>('');
    useEffect(() => {
        if (segments.length > 0) {
            setCountryName(segments[0].country);
            setProvName(segments[0].province);
        }
    }, [segments]);

    return (
        <Container className='mb-4 mt-4'>
            <h2 className='pb-2 pt-2 display-6'>Segmentation Manager</h2>

            <LocationSelector
                countryName={countryName}
                provName={provName}
                setCountryName={setCountryName}
                setProvName={setProvName}
                setShowSub={() => { }}
                setShowNewSeg={() => { }}
            />

            <br />

            <SuperSegmentsTable
                provName={provName}
                countryName={countryName}
                superSegments={superSegments}
                segments={segments}
                setSegments={setSegments}
                setSuperSegments={setSuperSegments}
                token={token}
            />

            <br />

            <SegmentTable
                provName={provName}
                countryName={countryName}
                segments={segments}
                setSegments={setSegments}
                token={token}
                segReq={segReq || []}
            />

            <br />

            <ShowSubSegments segId={1} segName={'example segment'} token={token} data={[]} />
        </Container>
    );
};

export default SegmentManagementContent;
