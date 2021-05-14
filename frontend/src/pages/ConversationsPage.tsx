import ConversationsPageContent from '../components/content/ConversationsPageContent';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useIdeasWithBreakdown } from '../hooks/ideaHooks';


export default function ConversationsPage() {
  const { data, error, isLoading, isError } = useIdeasWithBreakdown();

  if (isLoading) {
    return (
      <div className="wrapper">
        <LoadingSpinner />
      </div>
    )
  }

  if (isError) {
    console.log(error);
    return (
      <div className="wrapper">
        <h2>Error</h2>
      </div>
    )
  }

  return (
    <>
      <div className="wrapper">
        <ConversationsPageContent ideas={data} />
      </div>
    </>
  )
}
