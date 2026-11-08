import React, { useState, useEffect, useCallback } from 'react';
import { Container, AppBar, Typography, Grow, Grid, Button, Paper } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Redirect, Route, Switch, useHistory, useLocation, useParams } from 'react-router-dom';

import Posts from './components/Posts/Posts';
import Form from './components/Form/Form';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import { getPosts } from './actions/posts';
import { logout, restoreSession } from './actions/auth';
import Auth from './components/Auth/Auth';
import useStyles from './styles';
import memories from './images/memories.png';

const App = () => {
  const [currentId, setCurrentId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();
  const classes = useStyles();
  const posts = useSelector((state) => state.posts);
  const auth = useSelector((state) => state.auth);
  const [logoutError, setLogoutError] = useState('');

  const loadPosts = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');

    try {
      await dispatch(getPosts());
    } catch (error) {
      setLoadError(error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : error.message);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  useEffect(() => {
    if (auth.status !== 'loading') {
      loadPosts();
    }
  }, [auth.status, auth.user, loadPosts]);

  useEffect(() => {
    const selectedPost = posts.find((post) => post._id === currentId);
    if (
      currentId !== null
      && (!selectedPost || !auth.user || selectedPost.user?.id !== auth.user.id)
    ) {
      setCurrentId(null);
    }
  }, [currentId, posts, auth.user]);

  const handleLogout = async () => {
    setLogoutError('');
    try {
      await dispatch(logout());
      setCurrentId(null);
      history.replace('/');
    } catch (error) {
      setLogoutError(error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : 'Unable to sign out. Please try again.');
    }
  };

  return (
    <Container maxWidth="lg">
      <AppBar className={classes.appBar} position="static" color="inherit">
        <Typography className={classes.heading} variant="h2" align="center">Memories</Typography>
        <img className={classes.image} src={memories} alt="icon" height="60" />
      </AppBar>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {auth.status === 'loading' && <Typography variant="body2">Restoring session...</Typography>}
        {auth.user && <Typography variant="body2">Signed in as {auth.user.fullName}</Typography>}
        {auth.user
          ? (
            <>
              <Button color="primary" component={Link} to="/create">Create memory</Button>
              <Button color="primary" component={Link} to="/account">My profile</Button>
              <Button color="primary" onClick={handleLogout}>Sign out</Button>
            </>
          )
          : (
            <>
              <Button color="primary" component={Link} to="/login">Sign in</Button>
              <Button variant="contained" color="primary" component={Link} to="/register">Create account</Button>
            </>
          )}
      </div>
      {(auth.error || logoutError) && (
        <Typography color="error" role="alert">{logoutError || auth.error}</Typography>
      )}
      <Grow in>
        <Container>
          <Switch>
            <Route
              exact
              path="/login"
              render={() => (
                <Auth
                  mode="login"
                  onModeChange={(mode) => history.push(mode ? `/${mode}` : '/')}
                  onSuccess={() => {
                    const destination = location.state && location.state.from
                      ? location.state.from.pathname
                      : '/';
                    history.replace(destination);
                  }}
                />
              )}
            />
            <Route
              exact
              path="/register"
              render={() => (
                <Auth
                  mode="register"
                  onModeChange={(mode) => history.push(mode ? `/${mode}` : '/')}
                  onSuccess={() => history.replace('/')}
                />
              )}
            />
            <ProtectedRoute exact path="/account">
              <Paper style={{ maxWidth: 560, margin: '32px auto', padding: 24 }}>
                <Typography variant="h5" gutterBottom>My profile</Typography>
                <Typography variant="body1">{auth.user && auth.user.fullName}</Typography>
                <Typography variant="body2" color="textSecondary">{auth.user && auth.user.email}</Typography>
              </Paper>
            </ProtectedRoute>
            <ProtectedRoute exact path="/create">
              <Form
                currentId={null}
                setCurrentId={() => history.push('/')}
                isLoading={isLoading}
                user={auth.user}
                onOpenAuth={() => history.push('/login')}
              />
            </ProtectedRoute>
            <ProtectedRoute exact path="/posts/:id/edit">
              <EditMemory
                isLoading={isLoading}
                user={auth.user}
                setCurrentId={() => history.push('/')}
              />
            </ProtectedRoute>
            <Route
              exact
              path="/"
              render={() => (
                <Grid container justify="space-between" alignItems="stretch" spacing={3}>
                  <Grid item xs={12} sm={7}>
                    <Posts
                      setCurrentId={setCurrentId}
                      isLoading={isLoading}
                      loadError={loadError}
                      onRetry={loadPosts}
                      user={auth.user}
                      onOpenAuth={(mode) => history.push(`/${mode}`)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Form
                      currentId={currentId}
                      setCurrentId={setCurrentId}
                      isLoading={isLoading || auth.status === 'loading'}
                      user={auth.user}
                      onOpenAuth={(mode) => history.push(`/${mode}`)}
                    />
                  </Grid>
                </Grid>
              )}
            />
            <Redirect to="/" />
          </Switch>
        </Container>
      </Grow>
    </Container>
  );
};

const EditMemory = ({ isLoading, user, setCurrentId }) => {
  const { id } = useParams();

  return (
    <Form
      currentId={id}
      setCurrentId={setCurrentId}
      isLoading={isLoading}
      user={user}
    />
  );
};

export default App;
