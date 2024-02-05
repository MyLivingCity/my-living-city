import React, { useState } from 'react';
import {
  Card,
  Table,
  Dropdown,
  Container,
  Button,
  Form,
  NavDropdown,
} from 'react-bootstrap';
import { deletePostBan } from 'src/lib/api/banRoutes';
import { updateFalseFlagIdea } from 'src/lib/api/flagRoutes';
import { updateIdeaStatus } from 'src/lib/api/ideaRoutes';
import { updateUser } from 'src/lib/api/userRoutes';
import { incrementBadPostCount } from 'src/lib/api/badPostingBehaviorRoutes';
import { USER_TYPES } from 'src/lib/constants';
import { IFlag } from 'src/lib/types/data/flag.type';
import { IIdeaWithAggregations } from 'src/lib/types/data/idea.type';
import { IProposalWithAggregations } from 'src/lib/types/data/proposal.type';
import { IUser } from 'src/lib/types/data/user.type';
import { PostBanModal } from '../modal/PostBanModal';
import { PostUnbanModal } from '../modal/PostUnbanModal';
import { UserSegmentInfoCard } from '../partials/UserSegmentInfoCard';

// THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO
// THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO
// THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO
interface ProposalManagementContentProps {
  users: IUser[] | undefined;
  token: string | null;
  user: IUser | null;
  proposals: IIdeaWithAggregations[] | undefined;
  ideas: IIdeaWithAggregations[] | undefined;
  flags: IFlag[] | undefined;
}

export const ProposalManagementContent: React.FC<
  ProposalManagementContentProps
> = ({ users, token, user, proposals, ideas, flags }) => {
  const [hideControls, setHideControls] = useState('');
  const [showUserSegmentCard, setShowUserSegmentCard] = useState(false);
  const [email, setEmail] = useState('');
  const [id, setId] = useState('');
  const [banModalProposalData, setBanModalProposalData] =
    useState<IIdeaWithAggregations>();
  const [showProposalBanModal, setShowProposalBanModal] =
    useState<boolean>(false);
  const [showProposalUnbanModal, setShowProposalUnbanModal] =
    useState<boolean>(false);
  const [ban, setBan] = useState<boolean>(false);
  const [active, setActive] = useState<boolean>(false);
  const [reviewed, setReviewed] = useState<boolean>(false);
  const UserSegmentHandler = (email: string, id: string) => {
    setShowUserSegmentCard(true);
    setEmail(email);
    setId(id);
  };
  const ProposalURL = '/proposals/';
  const userTypes = Object.keys(USER_TYPES);
  let userEmails: String[] = [];
  let proposalIdeas: IIdeaWithAggregations[] = [];
  let proposalFlags: number[] = [];
  if (ideas) {
    for (let i = 0; i < ideas.length; i++) {
      if (ideas[i].state === 'PROPOSAL') {
        proposalIdeas.push(ideas[i]);
      }
    }
  }
  if (proposals && users) {
    for (let i = 0; i < proposals!.length; i++) {
      for (let z = 0; z < users!.length; z++) {
        if (proposals[i].authorId!.toString() === users[z].id.toString()) {
          userEmails.push(users[z].email);
        }
      }
    }
  }
  if (proposals && flags) {
    for (let i = 0; i < proposals!.length; i++) {
      let counter = 0;
      for (let z = 0; z < flags!.length; z++) {
        if (proposals[i].id! === flags[z].ideaId) {
          counter++;
        }
      }
      proposalFlags.push(counter);
    }
  }
  return (
    <Container style={{ maxWidth: '80%', marginLeft: 50 }}>
      {showProposalBanModal ? (
        <PostBanModal
          show={showProposalBanModal}
          setShow={setShowProposalBanModal}
          post={banModalProposalData!}
          token={token}
        />
      ) : null}
      {showProposalUnbanModal ? (
        <PostUnbanModal
          show={showProposalUnbanModal}
          setShow={setShowProposalUnbanModal}
          post={banModalProposalData!}
          token={token}
        />
      ) : null}

      <Form>
        <h2 className="mb-4 mt-4">Proposal Management</h2>
        <Table bordered hover size="sm">
          <thead className="table-active">
            <tr>
              <th scope="col">User Email</th>
              <th scope="col">Name</th>
              <th scope="col">Proposal Title</th>
              <th scope="col">Proposal Description</th>
              <th scope="col">Proposal Link</th>
              <th scope="col">Number of Flags</th>
              <th scope="col">Segment</th>
              <th scope="col">Active</th>
              <th scope="col">Reviewed</th>
              <th scope="col">Quarantined Date</th>
              <th scope="col">Controls</th>
            </tr>
          </thead>
          <tbody>
            {proposals?.map((req: IIdeaWithAggregations, index: number) => (
              <tr key={req.id}>
                {req.id.toString() !== hideControls ? (
                  <>
                    <td>{userEmails[index]}</td>

                    <td>{proposalIdeas[index].firstName}</td>
                    <td>{req.title}</td>
                    <td>{req.description}</td>
                    <td>
                      <a href={ProposalURL + req.id}>Link</a>
                    </td>
                    <td>{proposalFlags[index].toString()}</td>
                    <td>{proposalIdeas[index].segmentName}</td>
                    <td>{req.active ? 'Yes' : 'No'}</td>
                    <td>{req.reviewed ? 'Yes' : 'No'}</td>
                    <td>{new Date(req.quarantined_at).toLocaleDateString()}</td>
                  </>
                ) : (
                  <>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>
                      <Form.Check
                        type="switch"
                        checked={req.active}
                        onChange={(e) => {
                          req.active = e.target.checked;
                          setBan(e.target.checked);
                        }}
                        id="ban-switch"
                      />
                    </td>
                    <td>
                      <Form.Check
                        type="switch"
                        checked={req.reviewed}
                        onChange={(e) => {
                          req.reviewed = e.target.checked;
                          setReviewed(e.target.checked);
                        }}
                        id="reviewed-switch"
                      />
                    </td>
                  </>
                )}
                <td>
                  {req.id.toString() !== hideControls ? (
                    <NavDropdown title="Controls" id="nav-dropdown">
                      {/* <Dropdown.Item onClick={()=>{
                                setHideControls(req.id.toString());
                                setBan(req.active);
                                }}>Edit</Dropdown.Item> */}
                      {req.banned ? (
                        <Dropdown.Item
                          onClick={() => {
                            setBanModalProposalData(req);
                            setShowProposalUnbanModal(true);
                          }}
                        >
                          Unban Proposal
                        </Dropdown.Item>
                      ) : (
                        <>
                          <Dropdown.Item
                            onClick={() => {
                              setBanModalProposalData(req);
                              setShowProposalBanModal(true);
                              incrementBadPostCount(token, req.id.toString());
                            }}
                          >
                            Ban Proposal
                          </Dropdown.Item>
                          {req.reviewed && req.active ? (
                            <Dropdown.Item
                              onClick={() => {
                                updateFalseFlagIdea(
                                  parseInt(req.id.toString()),
                                  token!,
                                  false
                                );
                                setActive((req.active = false));
                                setReviewed((req.reviewed = false));
                                updateIdeaStatus(
                                  token,
                                  req.id.toString(),
                                  req.active,
                                  req.reviewed,
                                  req.banned,
                                  req.quarantined_at
                                );
                              }}
                            >
                              Quarantine Proposal
                            </Dropdown.Item>
                          ) : (
                            <Dropdown.Item
                              onClick={() => {
                                updateFalseFlagIdea(
                                  parseInt(req.id.toString()),
                                  token!,
                                  true
                                );
                                setActive((req.active = true));
                                setReviewed((req.reviewed = true));
                                updateIdeaStatus(
                                  token,
                                  req.id.toString(),
                                  req.active,
                                  req.reviewed,
                                  req.banned,
                                  req.quarantined_at
                                );
                              }}
                            >
                              Remove from Quarantine
                            </Dropdown.Item>
                          )}
                        </>
                      )}
                    </NavDropdown>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        className="mr-2 mb-2"
                        onClick={() => setHideControls('')}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setHideControls('');
                          if (req.active === true && req.reviewed === true) {
                            updateFalseFlagIdea(
                              parseInt(req.id.toString()),
                              token!,
                              true
                            );
                          } else {
                            updateFalseFlagIdea(
                              parseInt(req.id.toString()),
                              token!,
                              false
                            );
                          }
                          updateIdeaStatus(
                            token,
                            req.id.toString(),
                            req.active,
                            req.reviewed,
                            req.banned,
                            req.quarantined_at
                          );
                        }}
                      >
                        Save
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Form>
      <br></br>
      {/* <UserSegmentHandler/> */}
      {showUserSegmentCard && (
        <UserSegmentInfoCard email={email} id={id} token={token} />
      )}
    </Container>
  );
};
