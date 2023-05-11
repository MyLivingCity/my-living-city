import React, { useState } from "react";
import {
  Table,
  Dropdown,
  Container,
  Form,
  NavDropdown,
} from "react-bootstrap";
import { updateFalseFlagIdea } from "src/lib/api/flagRoutes";
import { updateIdeaStatus } from "src/lib/api/ideaRoutes";
import { incrementBadPostCount, resetBadPostCount } from "src/lib/api/badPostingBehaviorRoutes"
import { USER_TYPES } from "src/lib/constants";
import { IFlag } from "src/lib/types/data/flag.type";
import { IIdeaWithAggregations } from "src/lib/types/data/idea.type";
import { IUser } from "src/lib/types/data/user.type";
import { UserSegmentInfoCard } from "../partials/UserSegmentInfoCard";
import { PostBanModal } from "../modal/PostBanModal";
import { PostUnbanModal } from "../modal/PostUnbanModal";

// THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO
// THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO
// THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO // THIS IS STILL TO DO
interface IdeaManagementContentProps {
  users: IUser[] | undefined;
  token: string | null;
  user: IUser | null;
  ideas: IIdeaWithAggregations[] | undefined;
  flags: IFlag[] | undefined;
}
export const IdeaManagementContent: React.FC<IdeaManagementContentProps> = ({
  users,
  token,
  user,
  ideas,
  flags,
}) => {
  const [hideControls, setHideControls] = useState("");
  const [showUserSegmentCard, setShowUserSegmentCard] = useState(false);
  const [email, setEmail] = useState("");
  const [id, setId] = useState("");
  const [banModalIdeaData, setBanModalIdeaData] =
    useState<IIdeaWithAggregations>();
  const [showIdeaBanModal, setShowIdeaBanModal] = useState<boolean>(false);
  const [showIdeaUnbanModal, setShowIdeaUnbanModal] = useState<boolean>(false);
  const [active, setActive] = useState<boolean>();
  const [reviewed, setReviewed] = useState<boolean>();
  const UserSegmentHandler = (email: string, id: string) => {
    setShowUserSegmentCard(true);
    setEmail(email);
    setId(id);
  };
  const ideaURL = "/ideas/";
  const userTypes = Object.keys(USER_TYPES);
  let userEmails: String[] = [];
  let ideaFlags: number[] = [];
  if (ideas) {
    for (let i = 0; i < ideas.length; i++) {
      if (ideas[i].state === "PROPOSAL") {
        //ideas.splice(i, 1);
      }
    }
  }

  if (ideas && users) {
    for (let i = 0; i < ideas!.length; i++) {
      for (let z = 0; z < users!.length; z++) {
        if (ideas[i].authorId!.toString() === users[z].id.toString()) {
          userEmails.push(users[z].email);
        }
      }
    }
  }
  if (ideas && flags) {
    for (let ideaIndex = 0; ideaIndex < ideas!.length; ideaIndex++) {
      let counter = 0;
      for (let flagIndex = 0; flagIndex < flags!.length; flagIndex++) {
        if (ideas[ideaIndex].id === flags[flagIndex].ideaId) {
          counter++;
        }
      }
      ideaFlags.push(counter);
    }
  }

  return (
    <Container style={{ maxWidth: "80%", marginLeft: 50 }}>
      {showIdeaBanModal ? (
        <PostBanModal
          show={showIdeaBanModal}
          setShow={setShowIdeaBanModal}
          post={banModalIdeaData!}
          token={token}
        />
      ) : null}
      {showIdeaUnbanModal ? (
        <PostUnbanModal
          show={showIdeaUnbanModal}
          setShow={setShowIdeaUnbanModal}
          post={banModalIdeaData!}
          token={token}
        />
      ) : null}
      <Form>
        <h2 className="mb-4 mt-4">Idea Management</h2>
        <Table bordered hover size="sm">
          <thead className="table-active">
            <tr>
              <th scope="col">User Email</th>
              <th scope="col">Name</th>
              <th scope="col">Idea Title</th>
              <th scope="col">Idea Description</th>
              <th scope="col">Idea Link</th>
              <th scope="col">Number of Flags</th>
              <th scope="col">Segment</th>
              <th scope="col">Active</th>
              <th scope="col">Reviewed</th>
              <th scope="col">Quarantined Date</th>
              <th scope="col">Controls</th>
            </tr>
          </thead>
          <tbody>
            {ideas?.map((req: IIdeaWithAggregations, index: number) => (
              <tr key={req.id}>
                {req.id.toString() !== hideControls ? (
                  <>
                    <td>{userEmails[index]}</td>
                    <td>{req.firstName}</td>
                    <td>{req.title}</td>
                    <td>{req.description}</td>
                    <td>
                      <a href={ideaURL + req.id}>Link</a>
                    </td>
                    <td>{ideaFlags[index].toString()}</td>
                    <td>{req.segmentName}</td>
                    <td>{req.active ? "Yes" : "No"}</td>
                    <td>{req.reviewed ? "Yes" : "No"}</td>
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
                          setActive(e.target.checked);
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
                                setReviewed(req.reviewed);
                                }}>Edit</Dropdown.Item> */}
                      {req.banned ? (
                        <Dropdown.Item
                          onClick={() => {
                            setBanModalIdeaData(req);
                            setShowIdeaUnbanModal(true);
                          }}
                        >
                          Unban Idea
                        </Dropdown.Item>
                      ) : (
                        <>
                          <Dropdown.Item
                            onClick={() => {
                              setBanModalIdeaData(req);
                              setShowIdeaBanModal(true);
                              incrementBadPostCount(token, req.id.toString());
                            }}
                          >
                            Ban Idea
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
                              Quarantine Idea
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
                                resetBadPostCount(token, req.id.toString());
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
                      {/* <Button size="sm" variant="outline-danger" className="mr-2 mb-2" onClick={()=>setHideControls('')}>Cancel</Button>
                        <Button size="sm" onClick={()=>{
                            setHideControls('');
                            if(req.active === true && req.reviewed === true){
                                updateFalseFlagIdea(parseInt(req.id.toString()), token!, true);
                            }else{
                                updateFalseFlagIdea(parseInt(req.id.toString()), token!, false);
                            }
                            updateIdeaStatus(token, user?.id, req.id.toString(), req.active, req.reviewed, new Date());
                            }}>Save</Button> */}
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
