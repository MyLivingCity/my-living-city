import { Route, Switch } from "react-router-dom";
import Footer from "./components/ui/Footer";
import Header from "./components/ui/Header";

// Pages
import { ROUTES, USER_TYPES } from "./lib/constants";
import LandingPage from "./pages/LandingPage";
import ConversationsPage from "./pages/ConversationsPage";
import ProfilePage from "./pages/ProfilePage";
import RegisterPage from "./pages/RegisterPage";
import SingleIdeaPage from "./pages/SingleIdeaPage";
import SingleProposalPage from "./pages/SingleProposalPage";
import Team404Page from "./pages/Team404Page";
import TestPage from "./pages/TestPage";
import SubmitIdeaPage from "./pages/SubmitIdeaPage";
import LoginPage from "./pages/LoginPage";
import PrivateRoute from "./components/utility/PrivateRoute";
import PublicRoute from "./components/utility/PublicRoute";
import SubmitAdvertisementPage from "./pages/SubmitAdvertisementPage";
import ResetPasswordContent from "./pages/ResetPasswordPage";
import SegmentManagementPage from "./pages/SegmentManagementPage";
import AllAdsPage from "./pages/AllAdsPage";
import UserAdsPage from "./pages/UserAdsPage";
import EditAdsPage from "./pages/EditAdsPage";
import AdminRoute from "./components/utility/AdminRoute";
import CustomRoute from "./components/utility/CustomRoute";
import UserManagementPage from "./pages/UserManagementPage";
import SubmitDirectProposalPage from "./pages/SubmitDirectProposalPage";
import DashboardPage from "./pages/DashboardPage";
import MyPostsPage from "./pages/MyPostsPage";
import CommunityDashboardPage from "./pages/CommunityDashboardPage";

function App() {
  return (
    <div className="App">
      {/* maybe put layout content wrapping around switch case? */}
      <Header />
      <div className="main-content">
        <Switch>
          <Route path={ROUTES.LANDING} component={LandingPage} exact />
          <Route
            path={ROUTES.CONVERSATIONS}
            component={ConversationsPage}
            exact
          />
          <Route path={ROUTES.SINGLE_IDEA} component={SingleIdeaPage} />
          <Route path={ROUTES.SINGLE_PROPOSAL} component={SingleProposalPage} />
          <PublicRoute path={ROUTES.LOGIN} component={LoginPage} />
          <PublicRoute path={ROUTES.REGISTER} component={RegisterPage} />
          <PublicRoute
            path={ROUTES.RESET_PASSWORD}
            component={ResetPasswordContent}
          />
          <PrivateRoute path={ROUTES.SUBMIT_IDEA} component={SubmitIdeaPage} />
          <PrivateRoute path={ROUTES.USER_PROFILE} component={ProfilePage} />
          <PrivateRoute
            path={ROUTES.TEST_PAGE}
            redirectPath="/ideas/1"
            component={TestPage}
          />

          <PrivateRoute
            path={ROUTES.SUBMIT_DIRECT_PROPOSAL}
            component={SubmitDirectProposalPage}
          />
          <PrivateRoute path={ROUTES.My_POSTS} component={MyPostsPage} />
          <PrivateRoute path={ROUTES.DASHBOARD} component={DashboardPage} />

          <CustomRoute 
            path={ROUTES.USER_ADVERTISEMENTS} 
            component={UserAdsPage}
            userTypes={[USER_TYPES.BUSINESS, USER_TYPES.COMMUNITY]}/>
          <CustomRoute
            path={ROUTES.SUBMIT_ADVERTISEMENT}
            component={SubmitAdvertisementPage}
            userTypes={[USER_TYPES.BUSINESS, USER_TYPES.COMMUNITY, USER_TYPES.ADMIN]}
          />
          <CustomRoute 
            path={ROUTES.COMMUNITY_DASHBOARD}
            component={CommunityDashboardPage}
            userTypes={[USER_TYPES.RESIDENTIAL, USER_TYPES.BUSINESS, USER_TYPES.COMMUNITY]}
          />

          <AdminRoute path={ROUTES.ALL_ADVERTISEMENT} component={AllAdsPage} />
          <AdminRoute
            path={ROUTES.EDIT_ADVERTISEMENT}
            component={EditAdsPage}
          />
          <AdminRoute
            path={ROUTES.SEGMENT_MANAGEMENT}
            component={SegmentManagementPage}
          />
          <CustomRoute
            path={ROUTES.USER_MANAGEMENT}
            component={UserManagementPage}
            userTypes={[USER_TYPES.ADMIN, USER_TYPES.MOD]}
          />

          <Route path={ROUTES.TEAM404} component={Team404Page} />
        </Switch>
      </div>
      <Footer />
    </div>
  );
}

export default App;
