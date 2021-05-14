import { useContext } from 'react'
import { RouteProps, Route, Redirect } from 'react-router-dom'
import { UserProfileContext } from '../../contexts/UserProfile.Context';
import { ROUTES } from '../../lib/constants';

/**
 * Mainly used for signup and signin pages where once logged in user should be redirected to home page
 */
interface PublicRouteProps {
  path: RouteProps['path'];
  component: React.ElementType
}

const PublicRoute: React.FC<PublicRouteProps> = ({
  component: Component,
  ...routeProps
}) => {
  const {
    user,
    token
  } = useContext(UserProfileContext);
  const ComponentToRender = Component as React.ElementType;
  let isLoggedIn = false;
  if (!!user && !!token) {
    isLoggedIn = true;
  }

  return (
    <Route
      {...routeProps}
      render={(props) =>
        isLoggedIn ? (
          <Redirect to={ROUTES.LANDING} />
        ) : (
          <ComponentToRender {...props} />
        )
      }
    />
  );
}

export default PublicRoute