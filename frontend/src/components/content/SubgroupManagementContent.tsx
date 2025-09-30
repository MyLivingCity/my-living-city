import { ISegment, ISegmentRequest, ISuperSegment } from '../../lib/types/data/segment.type';
import React, { useState, useEffect } from 'react';
import { Container, Button, Modal } from 'react-bootstrap';
import SubgroupCreateFormContent from './SubgroupCreateFormContent';
import SubgroupFilterFormContent from './SubgroupFilterFormContent';
import SubgroupTableContent from './SubgroupTableContent';
import { ISubGroup } from 'src/lib/types/data/subgroup.type';
import { getAllSubgroups } from 'src/lib/api/subgroupRoutes';

interface SubgroupManagementContentProps {
    segments: ISegment[] | undefined;
    token: string;
}

const SubgroupManagementContent: React.FC<SubgroupManagementContentProps> = ({
    segments: segs,
    token,
}) => {
    const [showCreateSubgroupForm, setShowCreateSubgroupForm] = useState(false);
    const [segments, setSegments] = useState<ISegment[]>(segs || []);
    const [superSegments, setSuperSegments] = useState<ISuperSegment[]>([]);
    const [countryName, setCountryName] = useState<string>('');
    const [provName, setProvName] = useState<string>('');

    const [nameFilter, setNameFilter] = useState('');
    const [subgroupTypeFilter, setSubgroupTypeFilter] = useState('');
    const [subgroupPriv, setSubgroupPriv] = useState('');
    const [subgroups, setSubgroups] = useState<ISubGroup[]>([]);

    useEffect(() => {
        if (segments.length > 0) {
            setCountryName(segments[0].country);
            setProvName(segments[0].province);
        }
    }, [segments]);

    // fetch subgroups on mount
    useEffect(() => {
        const fetchSubgroups = async () => {
            try {
                const data = await getAllSubgroups(token);
                setSubgroups(data);
            } catch (err) {
                console.error('Failed to fetch subgroups:', err);
            }
        };
        fetchSubgroups();
    }, [token]);

    const handleSubgroupCreated = (newSubgroup: ISubGroup) => {
        setSubgroups((prev) => [...prev, newSubgroup]);
    };

    return (
        <Container className='mt-4 mb-4'>
            <div className='d-flex justify-content-between'>
                <h2 className='mb-4 mt-4'>Subgroup Manager</h2>
                <Button
                    variant='primary'
                    className='mb-4 mt-4'
                    onClick={() => setShowCreateSubgroupForm(true)}
                >
                    Create a New Subgroup
                </Button>
            </div>
            {showCreateSubgroupForm && (
                <Modal
                    show={showCreateSubgroupForm}
                    onHide={() => setShowCreateSubgroupForm(false)}
                    size='xl'
                >
                    <Modal.Header>
                        <Modal.Title>Create Subgroup</Modal.Title>
                        <Button
                            variant='primary'
                            size='sm'
                            onClick={() => setShowCreateSubgroupForm(false)}
                        >
                            x
                        </Button>
                    </Modal.Header>
                    <Modal.Body>
                        <SubgroupCreateFormContent
                            segments={segments}
                            token={token}
                            countryName={countryName}
                            provName={provName}
                            setCountryName={setCountryName}
                            setProvName={setProvName}
                            onCancel={() => setShowCreateSubgroupForm(false)}
                            onCreated={handleSubgroupCreated}
                        />
                    </Modal.Body>
                </Modal>
            )}

            <SubgroupFilterFormContent
                segments={segments}
                token={token}
                countryName={countryName}
                provName={provName}
                setCountryName={setCountryName}
                setProvName={setProvName}
                nameFilter={nameFilter}
                setNameFilter={setNameFilter}
                subgroupTypeFilter={subgroupTypeFilter}
                setSubgroupTypeFilter={setSubgroupTypeFilter}
                subgroupPriv={subgroupPriv}
                setSubgroupPriv={setSubgroupPriv}
            />

            <SubgroupTableContent
                token={token}
                subgroups={subgroups}
                nameFilter={nameFilter}
                subgroupTypeFilter={subgroupTypeFilter}
                subgroupPriv={subgroupPriv}
                onUpdateSubgroups={setSubgroups}
            />
        </Container>
    );
};

export default SubgroupManagementContent;
