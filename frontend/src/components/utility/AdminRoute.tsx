import { useContext } from 'react';
import { RouteProps, Route, Redirect } from 'react-router-dom';
import { UserProfileContext } from '../../contexts/UserProfile.Context';
import { ROUTES } from '../../lib/constants';

/**
 * Private Route Higher Order Component that checks if the user is logged in 
 * and redirects them to the desired authenticated page or redirects them to login page
 * if they are not authenticated. 
 */
interface AdminRouteProps {
    redirectPath?: string;
    path: RouteProps['path'];
    component: React.ElementType
    }

const AdminRoute: React.FC<AdminRouteProps> = ({
    redirectPath,
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
                isLoggedIn && (user!.userType === 'SUPER_ADMIN' || user!.userType === 'ADMIN') ? (
                    <ComponentToRender {...props} />
                ) : (
                    <Redirect to={ redirectPath || ROUTES.LOGIN } />
                )
            }
        />
    );
};

export default AdminRoute;