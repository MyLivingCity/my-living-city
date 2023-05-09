import React from "react";
import { RouteComponentProps } from "react-router-dom";
import SingleIdeaPageContent from "../components/content/SingleIdeaPageContent";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useSingleIdea } from "../hooks/ideaHooks";

// TODO: Pages are responsible for fetching, error handling, and loading spinner

// Extends Route component props with idea title route param
interface SingleIdeaPageProps
  extends RouteComponentProps<{
    ideaId: string;
  }> {
  // Add custom added props here
}

const SingleIdeaPage: React.FC<SingleIdeaPageProps> = (props) => {
  // Destructured props
  const {
    match: {
      params: { ideaId },
    },
  } = props;

  const { data, isLoading, isError } = useSingleIdea(ideaId);
 
  if (isError) {
   
    return (
      <div className="wrapper">
        <p>
          Error occured while trying to retrieve idea. Please try again later.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="wrapper">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="wrapper">
      {data && <SingleIdeaPageContent ideaData={data} ideaId={ideaId} />}
    </div>
  );
};

export default SingleIdeaPage;
