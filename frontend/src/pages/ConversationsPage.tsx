import ConversationsPageContent from "../components/content/ConversationsPageContent";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useProposalsWithBreakdown } from "src/hooks/proposalHooks";
import { useIdeasWithBreakdown } from "src/hooks/ideaHooks";

export default function ConversationsPage() {
  const {
    data: iData,
    error: iError,
    isLoading: iLoading,
    isError: iIsError,
  } = useIdeasWithBreakdown();
  const {
    data: pData,
    error: pError,
    isLoading: pLoading,
    isError: pIsError,
  } = useProposalsWithBreakdown();

  if (iError || pError) {
    console.log(iError);
    return (
      <div className="wrapper">
        <h2>Error</h2>
      </div>
    );
  }

  return (
    <>
      <div className="wrapper">
        <ConversationsPageContent ideas={iData} proposals={pData} />
      </div>
    </>
  );
}
