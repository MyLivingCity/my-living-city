import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from '@mui/material';
import { AiOutlineStar } from 'react-icons/ai';
import { BsPeople, BsHeartHalf } from 'react-icons/bs';

export const SuggestedIdeasTable: React.FC<any> = (props) => {
    const { suggestedIdeas } = props;

    return (
        <TableContainer
            component={Paper}
            sx={{
                margin: '0',
                overflowX: 'auto',
                '@media (max-width: 768px)': {
                    '& .MuiTableCell-root': {
                        minWidth: '150px',
                    }
                },
                boxShadow: 'none',
                border: 0
            }}
        >
            <Table stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell>Author</TableCell>
                        <TableCell>Idea</TableCell>
                        <TableCell align='center'><AiOutlineStar /></TableCell>
                        <TableCell align='center'><BsPeople /></TableCell>
                        <TableCell align='center'><BsHeartHalf /></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {suggestedIdeas.map((suggestion: any) => {
                        const averageRating = suggestion.ratings.reduce((sum: number, rating: any) => sum + rating.rating, 0) / suggestion.ratings.length;
                        const positiveRatings = suggestion.ratings.filter((rating: any) => rating.rating > 0).length;
                        const negativeRatings = suggestion.ratings.filter((rating: any) => rating.rating < 0).length;

                        return (
                            <TableRow key={suggestion.id}>
                                <TableCell>
                                    {Number(suggestion?.subSegment?.id) ? (
                                        Number(suggestion?.subSegment?.id) === suggestion?.author?.userSegments?.homeSubSegmentId
                                            ? `${suggestion?.author?.userSegments?.homeSegHandle} As Resident`
                                            : Number(suggestion?.subSegment?.id) === suggestion?.author?.userSegments?.workSubSegmentId
                                                ? suggestion?.author?.userSegments?.workSegHandle || `${suggestion?.author?.userSegments?.homeSegHandle} As Worker`
                                                : Number(suggestion?.subSegment?.id) === suggestion?.author?.userSegments?.schoolSubSegmentId
                                                    ? `${suggestion?.author?.userSegments?.schoolSegHandle} As Student`
                                                    : `${suggestion?.author?.userSegments?.homeSegHandle} As Resident`
                                    ) : Number(suggestion?.segment?.segId) ? (
                                        Number(suggestion?.segment?.segId) === suggestion?.author?.userSegments?.homeSegmentId
                                            ? `${suggestion?.author?.displayFName}@${suggestion?.author?.displayLName} As Resident`
                                            : Number(suggestion?.segment?.segId) === Number(suggestion?.author?.userSegments?.workSegmentId)
                                                ? suggestion?.author?.userSegments?.workSegHandle || `${suggestion?.author?.userSegments?.homeSegHandle} As Worker`
                                                : Number(suggestion?.segment?.segId) === suggestion?.author?.userSegments?.schoolSegmentId
                                                    ? `${suggestion?.author?.userSegments?.schoolSegHandle} As Student`
                                                    : `${suggestion?.author?.userSegments?.homeSegHandle} As Resident`
                                    ) : `${suggestion?.author?.userSegments?.homeSegHandle} As Resident`}
                                </TableCell>

                                <TableCell>
                                    <a href={'/ideas/' + suggestion.id}>
                                        {suggestion.title}
                                    </a>
                                </TableCell>
                                <TableCell align='center'>{isNaN(averageRating) ? 0 : averageRating}</TableCell>
                                <TableCell align='center'>{suggestion.ratings.length + suggestion.comments.length}</TableCell>
                                <TableCell align='center'>{positiveRatings} / {negativeRatings}</TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default SuggestedIdeasTable;
