import React from 'react';
import { Button, Grid, Typography } from '@material-ui/core';
import { useSelector } from 'react-redux';

import Post from './Post/Post';
import useStyles from './styles';

const Posts = ({ setCurrentId, isLoading, loadError, onRetry, user, onOpenAuth }) => {
  const posts = useSelector((state) => state.posts);
  const classes = useStyles();

  if (isLoading && !posts.length) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <Typography variant="h6">Loading memories...</Typography>
      </div>
    );
  }

  if (loadError && !posts.length) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <Typography variant="h6" color="error">{loadError}</Typography>
        <Typography variant="body2">
          <Button onClick={onRetry} disabled={isLoading}>Try again</Button>
        </Typography>
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <Typography variant="h6">No memories yet.</Typography>
        <Typography variant="body2">Create the first one using the form.</Typography>
      </div>
    );
  }

  return (
    <>
      {loadError && <Typography color="error" role="alert">{loadError}</Typography>}
      <Grid className={classes.container} container alignItems="stretch" spacing={3}>
        {posts.map((post) => (
          <Grid key={post._id} item xs={12} sm={6} md={6}>
            <Post post={post} setCurrentId={setCurrentId} user={user} onOpenAuth={onOpenAuth} />
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default Posts;
