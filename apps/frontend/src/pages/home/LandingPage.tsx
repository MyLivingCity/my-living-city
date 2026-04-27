import LandingPageContent from "src/components/content/home/LandingPageContent";
import { useIdeasHomepage } from "src/hooks/ideaHooks";
export default function LandingPage() {
  const { data, isLoading, error, isError } = useIdeasHomepage();
  return (
    <div className="wrapper">
      <LandingPageContent
        topIdeas={data}
        ideasLoading={isLoading}
        ideasIsError={isError}
        ideasError={error}
      />
    </div>
  );
}
