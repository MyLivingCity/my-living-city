import React from 'react';
import { Pagination, Row, Col } from 'react-bootstrap';

interface PublicProfilePaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const PublicProfilePagination: React.FC<PublicProfilePaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange
}) => {
    if (totalPages <= 1) return null;

    const getVisiblePages = () => {
        const visiblePages: (number | string)[] = [];
        const maxVisiblePages = 7;
        
        if (totalPages <= maxVisiblePages) {
            // Show all pages if total is small
            for (let i = 1; i <= totalPages; i++) {
                visiblePages.push(i);
            }
        } else {
            // Always show first page
            visiblePages.push(1);
            
            if (currentPage > 4) {
                visiblePages.push('...');
            }
            
            // Show pages around current page
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            
            for (let i = start; i <= end; i++) {
                if (!visiblePages.includes(i)) {
                    visiblePages.push(i);
                }
            }
            
            if (currentPage < totalPages - 3) {
                visiblePages.push('...');
            }
            
            // Always show last page
            if (!visiblePages.includes(totalPages)) {
                visiblePages.push(totalPages);
            }
        }
        
        return visiblePages;
    };

    const visiblePages = getVisiblePages();

    return (
        <Row className='justify-content-center'>
            <Col xs='auto'>
                <Pagination className='mb-0'>
                    {/* Previous Button */}
                    <Pagination.Prev 
                        disabled={currentPage === 1}
                        onClick={() => onPageChange(currentPage - 1)}
                    />
                    
                    {/* Page Numbers */}
                    {visiblePages.map((page, index) => {
                        if (page === '...') {
                            return (
                                <Pagination.Ellipsis 
                                    key={`ellipsis-${index}`}
                                    disabled 
                                />
                            );
                        }
                        
                        const pageNum = page as number;
                        return (
                            <Pagination.Item
                                key={pageNum}
                                active={pageNum === currentPage}
                                onClick={() => onPageChange(pageNum)}
                            >
                                {pageNum}
                            </Pagination.Item>
                        );
                    })}
                    
                    {/* Next Button */}
                    <Pagination.Next 
                        disabled={currentPage === totalPages}
                        onClick={() => onPageChange(currentPage + 1)}
                    />
                </Pagination>
            </Col>
        </Row>
    );
};

export default PublicProfilePagination;