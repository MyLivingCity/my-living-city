import React, { useState } from 'react';
import { Button, Container, Form, Modal, Row } from 'react-bootstrap';
import IdeaCommentTile from 'src/components/tiles/IdeaComment/IdeaCommentTile';
import { ICreateCommentInput } from 'src/lib/types/input/createComment.input';
import { IComment } from '../../../lib/types/data/comment.type';



/*

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
            <Modal.Title>You Are Banned!</Modal.Title>
          </Row>
          <Row className='text-center'>
            <p>You were banned, and will be unbanned based on moderator action</p>
          </Row>

        </Container>
      </Modal.Header>
        <div className='w-100 d-flex justify-content-end'>
          <Button
            className='mr-3'
            variant="secondary"
            onClick={handleClose}
          >
            Close
          </Button>



        </div>

    </Modal>
    */