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
import DashboardPageContent from "../components/content/DashboardPageContent";
import { useIdeasHomepage, useUserIdeas } from "../hooks/ideaHooks";
import LoadingSpinner from "src/components/ui/LoadingSpinner";

export default function Dashboard() {
  const {
    data: iData,
    error: iError,
    isLoading: iLoading,
    isError: iIsError,
  } = useIdeasHomepage();

  const stringifiedUser = localStorage.getItem("logged-user");
  const loggedInUser = JSON.parse(stringifiedUser!);

  //CHANGES_NEEDED: Find way to wait for user id to be loaded before useUserIdeas
  const {
    data: uData,
    error: uError,
    isLoading: uLoading,
  } = useUserIdeas(loggedInUser.id);

  console.log(uData);

  return (
    <div className="wrapper">
      <DashboardPageContent
        topIdeas={iData}
        ideasLoading={iLoading}
        ideasIsError={iIsError}
        ideasError={iError}
        userIdeas={uData}
      />
    </div>
  );
}
