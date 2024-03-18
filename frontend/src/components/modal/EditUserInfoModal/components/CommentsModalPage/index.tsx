import React, { useEffect, useState } from 'react';
import { Card, Nav, Pagination } from 'react-bootstrap';
import LoadingSpinner from 'src/components/ui/LoadingSpinner';
import { IComment } from 'src/lib/types/data/comment.type';

interface CommentsModalPageProps {
    comments: IComment[];
    isLoading: boolean;
}

export const CommentsModalPage = (props: CommentsModalPageProps) => {
    const [items, setItems] = useState<any>([]);
    const [active, setActive] = useState<number>(1);

    useEffect(() => {
        let newItems = [];
        for (let number = 1; number <= (props.comments.length / 3) + 1; number++) {
            newItems.push(
                <Pagination.Item
                    key={number}
                    active={number === active}
                    onClick={() => setActive(number)}
                >
                    {number}
                </Pagination.Item>
            );
        }
        setItems(newItems);
    }, [props.comments, active]);

    if (props.isLoading) {
        return <LoadingSpinner />;
    }
    return (
        <div>
            {props.comments?.length === 0 ? (
                <div>No comments found</div>
            ) : (
                <>
                    <Pagination>
                        {items}
                    </Pagination>
                    {props.comments
                        .filter((comment, index) => index >= (active - 1) * 3 && index < active * 3)
                        .map((comment) => (
                            <Card key={comment.id}>
                                <Card.Body>
                                    <Card.Text className='mb-0'>{comment.content}</Card.Text>
                                    <Nav.Link
                                        className='text-muted'
                                        href={`/ideas/${comment.ideaId}`}
                                        style={{ paddingLeft: 0 }}
                                    >
                                        Idea: {comment.idea.title}
                                    </Nav.Link>
                                    <Card.Subtitle className='text-muted'>Posted: {comment.createdAt}</Card.Subtitle>
                                </Card.Body>
                            </Card>
                        ))}
                </>
            )}
        </div>
    );
};
