import React, { useEffect, useState, ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../../utils/auth';

interface PublicRouteProps {
  children: ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const location = useLocation();
  const [shouldRedirect, setShouldRedirect] = useState<boolean>(false);
  const [redirectPath, setRedirectPath] = useState<string>('/employee/dashboard');

  useEffect(() => {
    const isAuth = isAuthenticated();
    if (isAuth) {
      const userRole = localStorage.getItem('role');
      let path = '/employee/dashboard';
      if (userRole === 'admin') path = '/admin/dashboard';
      else if (userRole === 'hr') path = '/employee/dashboard';
      else if (userRole === 'manager') path = '/employee/dashboard';

      setRedirectPath(path);
      setShouldRedirect(true);
    }
  }, []);

  if (shouldRedirect) {
    return <Navigate to={redirectPath} replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

export default PublicRoute;
