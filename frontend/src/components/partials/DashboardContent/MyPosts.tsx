import { Container, Col, Breadcrumb, Carousel } from "react-bootstrap";
import IdeaTile from "src/components/tiles/IdeaTile";
import PlaceholderIdeaTile from "src/components/tiles/PlaceholderIdeaTile";
import ProposalTile from "src/components/tiles/ProposalTile";
import LoadingSpinner from "src/components/ui/LoadingSpinner";
import { IIdeaWithAggregations } from "src/lib/types/data/idea.type";
import { IProposalWithAggregations } from "src/lib/types/data/proposal.type";

interface MyPostsProps {
  userIdeas?: IIdeaWithAggregations[];
  userProposals?: IProposalWithAggregations[];
  numPosts: number;
  isDashboard: boolean;
  isLoading?: boolean;
}

const MyPosts: React.FC<MyPostsProps> = ({
  userIdeas = [],
  userProposals = [],
  numPosts,
  isDashboard,
  isLoading
}) => {
 
  let parsedPosts = userIdeas;
  if (numPosts > 0 && userIdeas) {
    parsedPosts = parsedPosts.slice(0, numPosts);
  }

  let userIdeaPages
  if (userIdeas) {
    userIdeaPages = Math.ceil(userIdeas.length / 3)
  }

  console.log("userIdeas", userIdeas)

  return (
    <Container
      className="container"
      id="hanging-icons"
      style={{
        padding: "2rem 1rem 1rem 1rem",
        margin: "0 auto",
      }}
    >
      {!isDashboard && (
        <>
          <style>
            {`
          .breadcrumb {
            padding-left: 0;
            background-color: #fff;
          }
          .container {
            padding: 1rem;
            .carousel-control-next,
            .carousel-control-prev {
                filter: invert(100%);
            }
            .carousel-control-next {
                right: -8rem;
            }
            .carousel-control-prev {
                left: -8rem;
            }
            .carousel-item.active, .carousel-item-next, .carousel-item-prev {
              display: flex;
              flex-wrap: wrap;
            }
            .container {
              padding-left: 0;
              padding-right: 0;
            }
            .carousel-indicators {
              display: none;
        `}
          </style>
          <Breadcrumb
            style={{
              backgroundColor: "fff",
            }}
          >
            <Breadcrumb.Item
              onClick={() => (window.location.href = "/dashboard")}
            >
              Dashboard
            </Breadcrumb.Item>
            <Breadcrumb.Item active>My Posts</Breadcrumb.Item>
          </Breadcrumb>
        </>
      )}

      <h2 className="pb-1 border-bottom display-6">My Posts</h2>
      
      {isLoading ? <LoadingSpinner/> : userIdeas && userIdeas.length > 0 ? (<Carousel controls={true} interval={null} slide={true} fade={false}>
        {[...Array(userIdeaPages)].map((x, i) => (
          <Carousel.Item key={i} id='slick'>
            {userIdeas
              ? userIdeas.slice(i * 3, i * 3 + 3).map((idea) => {
                return idea && idea.active ? 
                (
                  <Col
                    key={idea.id}
                    md={6}
                    lg={4}
                    className="pt-3 align-items-stretch"
                  >
                    {userProposals && idea.state === "PROPOSAL" ?
                    userProposals.map((proposal) => {
                      if (proposal.ideaId === idea.id) {
                        return <ProposalTile
                          proposalData={
                            {
                              id: proposal.id,
                              ideaId: proposal.ideaId,
                              idea: idea,
                            }
                          }
                          showFooter={true}
                          postType={idea.state === "IDEA" ? "Idea" : "Proposal"}
                        />
                      }
                    })
                    :
                    <IdeaTile
                      ideaData={idea}
                      showFooter={true}
                      postType={idea.state === "IDEA" ? "Idea" : "Proposal"}
                    />}
                  </Col>
                ) : null})
              : [...Array(12)].map((x, i) => (
                  <Col
                    key={i}
                    md={6}
                    lg={4}
                    className="pt-3 align-items-stretch"
                  >
                    <PlaceholderIdeaTile />
                  </Col>
                ))}
          </Carousel.Item>
        ))}
      </Carousel>) : <div>Sorry, you have not submitted any ideas yet!</div>}
        {/* <a className='pt-5 text-align-center' href="/ideas">
          <h3>View all ideas and conversations</h3>
        </a> */}
      
    </Container>
  );
};

export default MyPosts;
