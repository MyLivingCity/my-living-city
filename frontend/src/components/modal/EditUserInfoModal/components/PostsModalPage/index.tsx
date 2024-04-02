import React, { useEffect, useState } from 'react';
import { Card, Nav, Pagination } from 'react-bootstrap';
import LoadingSpinner from 'src/components/ui/LoadingSpinner';
import { IIdea } from 'src/lib/types/data/idea.type';

interface PostsModalPageProps {
    posts: IIdea[];
    isLoading: boolean;
}

export const PostsModalPage = (props: PostsModalPageProps) => {
    const [items, setItems] = useState<any>([]);
    const [active, setActive] = useState<number>(1);

    useEffect(() => {
        let newItems = [];
        for (let number = 1; number <= (props.posts.length / 3) + 1; number++) {
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
    }, [props.posts, active]);

    if (props.isLoading) {
        return <LoadingSpinner />;
    }
    return (
        <div>
            {props.posts?.length === 0 ? (
                <div>No Ideas found</div>
            ) : (
                <>
                    <Pagination>
                        {items}
                    </Pagination>
                    {props.posts
                        .filter((comment, index) => index >= (active - 1) * 3 && index < active * 3)
                        .map((comment) => (
                            <Card key={comment.id}>
                                <Card.Body className='mt-0 pt-0 pb-0'>
                                    <Nav.Link
                                        className='mt-0 mb-0 pt-2 pb-0'
                                        href={`/ideas/${comment.id}`}
                                        style={{ paddingLeft: 0 }}
                                    >
                                        {comment.title}
                                    </Nav.Link>
                                    <Card.Text className='mb-2'>Description: {comment.description}</Card.Text>
                                    <Card.Subtitle className='text-muted mb-2'>Created At: {comment.createdAt}</Card.Subtitle>
                                </Card.Body>
                            </Card>
                        ))}
                </>
            )}
        </div>
    );
};
