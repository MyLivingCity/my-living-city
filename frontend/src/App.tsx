import { Route, Switch } from 'react-router-dom';
import Footer from './components/ui/Footer';
import Header from './components/ui/Header';

// Pages
import { ROUTES } from './lib/constants';
import LandingPage from './pages/LandingPage';
import ConversationsPage from './pages/ConversationsPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import SingleIdeaPage from './pages/SingleIdeaPage';
import Team404Page from './pages/Team404Page';
import TestPage from './pages/TestPage';
import SubmitIdeaPage from './pages/SubmitIdeaPage';
import LoginPage from './pages/LoginPage';
import PrivateRoute from './components/utility/PrivateRoute';
import PublicRoute from './components/utility/PublicRoute';
import SubmitAdvertisementPage from './pages/SubmitAdvertisementPage';
import ResetPasswordContent from './pages/ResetPasswordPage'
function App() {
  return (
    <div className="App">
      {/* maybe put layout content wrapping around switch case? */}
      <Header />
      <div className="main-content">
        <Switch>
          <Route path={ROUTES.LANDING} component={LandingPage} exact />
          <Route path={ROUTES.CONVERSATIONS} component={ConversationsPage} exact />
          <Route path={ROUTES.SINGLE_IDEA} component={SingleIdeaPage} />
          <PublicRoute path={ROUTES.LOGIN} component={LoginPage} />
          <PublicRoute path={ROUTES.REGISTER} component={RegisterPage} />
          <PublicRoute path={ROUTES.RESET_PASSWORD} component={ResetPasswordContent} />
          <PrivateRoute path={ROUTES.SUBMIT_IDEA} component={SubmitIdeaPage} />
          <PrivateRoute path={ROUTES.USER_PROFILE} component={ProfilePage} />
          <PrivateRoute path={ROUTES.TEST_PAGE} redirectPath='/ideas/1' component={TestPage} />
          <PrivateRoute path={ROUTES.SUBMIT_ADVERTISEMENT} component={SubmitAdvertisementPage} />
          <Route path={ROUTES.TEAM404} component={Team404Page} />
        </Switch>
      </div>
      <Footer />
    </div>
  );
}

export default App;
