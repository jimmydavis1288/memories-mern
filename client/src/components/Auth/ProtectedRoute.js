import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { Typography } from '@material-ui/core';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, ...routeProps }) => {
  const { status, user } = useSelector((state) => state.auth);

  return (
    <Route
      {...routeProps}
      render={({ location }) => {
        if (status === 'loading') {
          return <Typography align="center">Restoring session...</Typography>;
        }

        if (!user) {
          return <Redirect to={{ pathname: '/login', state: { from: location } }} />;
        }

        return children;
      }}
    />
  );
};

export default ProtectedRoute;
