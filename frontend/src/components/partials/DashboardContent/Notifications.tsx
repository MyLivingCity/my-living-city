import { useEffect, useState } from "react";
import { Button, Container, Row, Col, Card, Table } from "react-bootstrap";
import { IIdeaWithAggregations } from "src/lib/types/data/idea.type";
import { IProposalWithAggregations } from "src/lib/types/data/proposal.type";
interface NotificationPageContentProps {
  userIdeas: IIdeaWithAggregations[] | undefined;
  // proposals: IProposalWithAggregations[] | undefined;
}



const Notifications: React.FC<NotificationPageContentProps> = ({ userIdeas }) => {
  // const messages = [
  //   "Post: New Park/flag was dismissed / Reason: Post met acceptable standards",
  //   "Comment: Dog Fountain at Mac.../flag was dismissed / Reason: Postmet acceptable standards",
  //   "Your Post: Get rid of the dogs / was flagged and Quarantine / Reason: Has abusive language, is hostile to a community segment",
  //   "New Community: West Bay / Is now active and you are located within it",
  // ];
  
  const [isDismissed, setIsDismissed] = useState(false);

  // const [filteredIdeas, setFilteredIdeas] = useState([])

  // const updatedFilteredIdeas = ideas?.filter((idea) => !idea.active)
  // setFilteredIdeas(updatedFilteredIdeas)
  console.log("Ideas", userIdeas)
  return (
    <Container
      className="system"
      id="hanging-icons"
      // Top Right Bottom Left
      style={{ padding: "3rem 1rem 0rem 1rem", margin: "0 auto" }}
    >
      <style>
        {`
         td {
            border-top: 0.5px solid #d4d4d4 !important;
            border-bottom: 0.5px solid #d4d4d4 !important;
         }
         tr:hover {
           background-color: #e8ffe9;
           cursor: pointer;
        }
        `}
      </style>
      <div className="d-flex justify-content-between border-bottom display-6">
        <div className="col-example text-left">
          <h2 className="display-6">Notifications</h2>
        </div>
        <div className="col-example text-left">
          <Button onClick={() => setIsDismissed(true)}>Dismiss All</Button>
        </div>
      </div>

      <div style={{ marginTop: "2rem" }}>
        {!isDismissed ? (
          <Table>
            <tbody>
              {userIdeas && userIdeas!.filter((userIdea) => !userIdea.active).map((userIdea, index) => (
                <tr
                  key={index}
                  onClick={() => (window.location.href = "/ideas")}
                >
                  <td>{userIdea.title}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <div>
            <p>No new notifications.</p>
          </div>
        )}
      </div>
    </Container>
  );
};

export default Notifications;
