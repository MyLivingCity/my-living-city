import { useContext, useEffect, useState } from "react";
import { Button, Alert } from "react-bootstrap"
import { useParams } from "react-router";
import { UserProfileContext } from "src/contexts/UserProfile.Context";
import { useSubmitChampionRequestMutation } from "src/hooks/championHooks";

interface ChampionSubmitProps {
  
}

const ChampionSubmit = (props: ChampionSubmitProps) => {
  const { token } = useContext(UserProfileContext);
  const { ideaId } = useParams<{ ideaId: string}>();

  // =================== SUBMITTING CHAMPION REQUEST MUTATION ==========================
  const {
    submitChampionRequestMutation,
    isError,
    error,
    isLoading,
  } = useSubmitChampionRequestMutation(parseInt(ideaId), token);

  const [ showChampionSubmitError, setShowChampionSubmitError ] = useState(false);

  useEffect(() => {
    setShowChampionSubmitError(isError);
  }, [isError])

  const submitHandler = () => {
    console.log("Submit Champion request");
    submitChampionRequestMutation();
  }

  return (
    <div className='d-flex flex-column justify-content-center align-items-center'>
      {showChampionSubmitError && (
        <Alert
          className='w-100'
          show={showChampionSubmitError}
          onClose={() => setShowChampionSubmitError(false)}
          dismissible
          variant='danger'
        >
          {/* {'An error occured while trying to champion an idea'} */}
          {error?.message ?? "An error occured while trying to champion an idea."}
        </Alert>
      )}
      <Button 
        onClick={submitHandler} 
        variant='warning'
        disabled={isLoading}
      >
        Champion!
      </Button>
    </div>
  );
}

export default ChampionSubmit