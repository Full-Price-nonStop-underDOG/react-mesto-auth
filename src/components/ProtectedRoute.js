import React from 'react';
import { Navigate } from 'react-router-dom';

// этот компонент принимает другой компонент в качестве пропса
// он также может взять неограниченное число пропсов и передать их новому компоненту
const ProtectedRouteElement = ({
  element: Component,
  isLoggedIn,
  ...props
}) => {
  if (isLoggedIn === true) {
    return <Component {...props} />;
  } (isLoggedIn === false || isLoggedIn === null || isLoggedIn === undefined) {
    return <Navigate to='/sign-in' replace />;
  }
};
export default ProtectedRouteElement;
