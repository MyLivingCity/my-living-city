import React, { useState } from 'react';
import { Row, Col, Form, Button, Card, Collapse } from 'react-bootstrap';


// Work in progress, should be functional but should be adjusted and expanded 
// after adding more accounts and different account types to the database.
interface SearchFilters {
    profileType?: 'MUNICIPAL' | 'BUSINESS' | '';
    location?: string;
    searchQuery?: string;
}

interface PublicProfileSearchProps {
    onSearch: (searchQuery: string, filters: SearchFilters) => void;
}

const PublicProfileSearch: React.FC<PublicProfileSearchProps> = ({ onSearch }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<SearchFilters>({
        profileType: '',
        location: ''
    });
    const [showFilters, setShowFilters] = useState(false);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(searchQuery, filters);
    };

    const handleFilterChange = (key: keyof SearchFilters, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        // Auto-apply filters when changed
        onSearch(searchQuery, newFilters);
    };

    const clearFilters = () => {
        const clearedFilters: SearchFilters = { profileType: '' as '', location: '' };
        setFilters(clearedFilters);
        setSearchQuery('');
        onSearch('', clearedFilters);
    };

    const hasActiveFilters = filters.profileType || filters.location || searchQuery;

    return (
        <Card className='mb-4'>
            <Card.Body>
                {/* Main Search Bar */}
                <Form onSubmit={handleSearchSubmit}>
                    <Row className='align-items-end'>
                        <Col md={8}>
                            <Form.Group>
                                <Form.Label>Search Public Profiles</Form.Label>
                                <div className='position-relative'>
                                    <Form.Control
                                        type='text'
                                        placeholder='Search by organization name, department, or description...'
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className='pe-5'
                                    />
                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={2}>
                            <Button 
                                type='submit' 
                                variant='primary' 
                                className='w-100'
                                disabled={!searchQuery.trim()}
                            >
                                Search
                            </Button>
                        </Col>
                        <Col md={2}>
                            <Button 
                                type='button' 
                                variant='outline-secondary' 
                                className='w-100 d-flex align-items-center justify-content-center'
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <span className='ms-2'>Filters</span>
                                {hasActiveFilters && (
                                    <span className='badge bg-primary ms-2 rounded-pill'>
                                        {[filters.profileType, filters.location, searchQuery].filter(Boolean).length}
                                    </span>
                                )}
                            </Button>
                        </Col>
                    </Row>
                </Form>

                {/* Advanced Filters */}
                <Collapse in={showFilters}>
                    <div className='mt-3 pt-3 border-top'>
                        <Row>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Profile Type</Form.Label>
                                    <Form.Control
                                        as='select'
                                        value={filters.profileType || ''}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                                            handleFilterChange('profileType', e.target.value as 'MUNICIPAL' | 'BUSINESS' | '')
                                        }
                                    >
                                        <option value=''>All Types</option>
                                        <option value='MUNICIPAL'>Municipality Profiles</option>
                                        <option value='BUSINESS'>Community Businesses</option>
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Location</Form.Label>
                                    <Form.Control
                                        type='text'
                                        placeholder='Enter city or postal code...'
                                        value={filters.location || ''}
                                        onChange={(e) => handleFilterChange('location', e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4} className='d-flex align-items-end'>
                                <Button 
                                    variant='outline-danger' 
                                    onClick={clearFilters}
                                    disabled={!hasActiveFilters}
                                    className='w-100'
                                >
                                    Clear All Filters
                                </Button>
                            </Col>
                        </Row>
                    </div>
                </Collapse>
            </Card.Body>
        </Card>
    );
};

export default PublicProfileSearch;