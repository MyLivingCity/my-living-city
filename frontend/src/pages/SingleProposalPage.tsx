import { useSingleProposal } from 'src/hooks/proposalHooks';
import SingleProposalPageContent from '../components/content/SingleProposalPageContent';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useSingleIdea } from '../hooks/ideaHooks';

// TODO: Pages are responsible for fetching, error handling, and loading spinner

const SingleProposalPage = (props: any) => {
  // Destructured props
  const {
    match: {
      params: { proposalId },
    },
  } = props;

  const {
    data: proposalData,
    error: proposalError,
    isLoading: proposalIsLoading,
    isError: proposalIsError,
  } = useSingleProposal(proposalId);

  //wait for proposal data to load
  if (!proposalIsLoading) {
    var ideaStringId = proposalData!.ideaId.toString();
  } else {
    var ideaStringId = '';
  }

  const { data, error: ideaError, isLoading: ideaIsLoading, isError: ideaIsError } = useSingleIdea(ideaStringId);

  proposalIsError && console.error(`Error fetching single proposal: ${proposalError}`)
  ideaIsError && console.error(`Error fetching single idea: ${ideaError}`)

  if (ideaIsError || proposalIsError) {
  
    return (
      <div className="wrapper">
        <p>
          Error occured while trying to retrieve proposal. Please try again
          later.
        </p>
      </div>
    );
  }

  if (ideaIsLoading || proposalIsLoading) {
    return (
      <div className="wrapper">
        <LoadingSpinner />
      </div>
    );
  }


  return (
    <div className="wrapper">
      {data && (
        <SingleProposalPageContent
          ideaData={data}
          proposalData={proposalData}
          ideaId={ideaStringId}
      
        />
      )}
    </div>
  );
};

export default SingleProposalPage;
