import React, { useState } from 'react'
import { Button, Card, Container, Modal, Row, Table } from 'react-bootstrap';
import { ICommentFlag, IFlag } from 'src/lib/types/data/flag.type';
import { IIdeaWithAggregations } from 'src/lib/types/data/idea.type';
import { IProposalWithAggregations } from 'src/lib/types/data/proposal.type';
import { IUser } from 'src/lib/types/data/user.type';
import { IComment } from '../../../lib/types/data/comment.type';

interface FlagModalProps {
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  show: boolean;
  user: IUser | null;
  ideas: IIdeaWithAggregations[] | undefined;
  proposals: IProposalWithAggregations[] | undefined;
  comments: IComment[] | undefined; 
  flags: IFlag[] | undefined;
  commentFlags: ICommentFlag[] | undefined; 

}

const UserFlagsModal = ({
  setShow,
  show,
  user,
  ideas,
  proposals,
  comments,
  flags,
  commentFlags,
}: FlagModalProps) => {
  const handleClose = () => setShow(false);
  const [commentText, setCommentText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const ideaURL = '/ideas/';
  let userFlaggedComment: IComment[] = [];
  let userFlaggedIdeas: IIdeaWithAggregations[] = [];
  let userFlaggedProposals: IProposalWithAggregations[] = []; 
if(commentFlags && user && comments){
    for(let i = 0; i < commentFlags.length; i++){
        for(let z = 0; z < comments.length; z++){
            if(commentFlags[i].commentId === comments[z].id && commentFlags[i].flaggerId === user.id){
                userFlaggedComment.push(comments[z]);
            }
        }
    }
}
if(flags && user && ideas){
    for(let i = 0; i < flags.length; i++){
        for(let z = 0; z < ideas.length; z++){
            if(flags[i].ideaId === ideas[z].id && flags[i].flaggerId === user.id){
                userFlaggedIdeas.push(ideas[z]);
            }
        }
    }
}
if(flags && user && proposals){
    for(let i = 0; i < flags.length; i++){
        for(let z = 0; z < proposals.length; z++){
            if(flags[i].ideaId === proposals[z].idea.id && flags[i].flaggerId === user.id){
                userFlaggedProposals.push(proposals[z]);
            }
        }
    }
}
  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      size='lg'
      animation={false}
    >
      <Modal.Header closeButton>
        <Container>
          <Row className='justify-content-center'>
            <Modal.Title>User Flag Data</Modal.Title>
          </Row>
          <Row className='text-center'>
          </Row>
        </Container>
      </Modal.Header>
      <Modal.Body>
        <Card>
        <Card.Body>
        <Table bordered hover size="sm">
        <thead>
            <tr style={{backgroundColor: 'rgba(52, 52, 52, 0.1)',height: '15'}}>
                <th scope="col">Idea Title</th>
                <th scope="col">Idea Description</th>
                <th scope="col">Idea Link</th>
            </tr>
        </thead>
        <tbody>
            {userFlaggedIdeas?.map((req: IIdeaWithAggregations, index: number) => (
                <tr key={req.id}>

                    <td>{req.title}</td>
                    <td>{req.description}</td>
                    <td><a href= {ideaURL + req.id}>Link</a></td> 
                </tr>
                ))}
        </tbody>
        </Table>
        </Card.Body>
        </Card>
        <Card>
        <Card.Body>
        <Table bordered hover size="sm">
        <thead>
            <tr style={{backgroundColor: 'rgba(52, 52, 52, 0.1)',height: '15'}}>
                <th scope="col">Post Link</th>
                <th scope="col">Comment Contents</th>
            </tr>
        </thead>
        <tbody>
            {userFlaggedComment?.map((req: IComment, index: number) => (
                <tr key={req.id}>
                    <td>{<a href= {ideaURL + req.ideaId}>Link</a>}</td>
                    <td>{req.content}</td> 
                </tr>
                ))}
        </tbody>
        </Table>
        </Card.Body>
        </Card>
      </Modal.Body>
      <Modal.Footer className='d-flex flex-column'>
        <div className='w-100 d-flex justify-content-end'>
          <Button
            className='mr-3'
            variant="secondary"
            onClick={handleClose}
          >
            Close
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default UserFlagsModal