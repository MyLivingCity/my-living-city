import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { ISegment, ISegmentRequest, ISuperSegment, SegmentType } from '../../lib/types/data/segment.type';
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
    const [segments, setSegments] = useState<ISegment[]>((segs || []).filter(s => s.segmentType === SegmentType.segment));
    const [superSegments, setSuperSegments] = useState<ISuperSegment[]>([]);
    const [countryName, setCountryName] = useState<string>('');
    const [provName, setProvName] = useState<string>('');
    useEffect(() => {
        const filtered = (segs || []).filter(s => s.segmentType === SegmentType.segment);
        if (filtered.length > 0) {
            setSegments(filtered);
            setCountryName(filtered[0].country);
            setProvName(filtered[0].province);
        } else {
            setSegments([]);
        }
        // We intentionally depend on segs to react to data reloads
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [segs]);

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
