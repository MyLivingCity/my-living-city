import MyPostsPageContent from "../components/content/MyPostsPageContent";
import { useUserIdeas } from "../hooks/ideaHooks";

export default function MyPostsPage() {
  //doesnt get loaded before useUserIdeas is called

  const stringifiedUser = localStorage.getItem("logged-user");
  const loggedInUser = JSON.parse(stringifiedUser!);



  //CHANGES_NEEDED: Find way to wait for user id to be loaded before useUserIdeas
  const {
    data: uData,
    error: uError,
    isLoading: uLoading,
  } = useUserIdeas(loggedInUser.id);

  return (
    <div className="wrapper">
      <MyPostsPageContent userIdeas={uData} />
    </div>
  );
}
