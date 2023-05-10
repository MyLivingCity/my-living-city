import { useContext, useState } from "react";
import {
  NavDropdown,
  Nav,
  Navbar,
  Form,
  FormControl,
  Button,
} from "react-bootstrap";
import NavbarCollapse from "react-bootstrap/esm/NavbarCollapse";
import { useUserWithJwtVerbose } from "src/hooks/userHooks";
import { UserProfileContext } from "src/contexts/UserProfile.Context";
import MyPostsPageContent from "../components/content/MyPostsPageContent";
import { useIdeasHomepage, useUserIdeas } from "../hooks/ideaHooks";
import LoadingSpinner from "src/components/ui/LoadingSpinner";
import UserProfileProvider from "src/contexts/UserProfile.Context";

export default function MyPostsPage() {
  //doesnt get loaded before useUserIdeas is called

  const stringifiedUser = localStorage.getItem("logged-user");
  const loggedInUser = JSON.parse(stringifiedUser!);

  console.log(loggedInUser.id);

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
