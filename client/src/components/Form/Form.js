import React, { useState, useEffect, useRef } from 'react';
import { TextField, Button, Typography, Paper } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import FileBase from 'react-file-base64';

import useStyles from './styles';
import { createPost, updatePost } from '../../actions/posts';

const emptyPost = { title: '', message: '', tags: '', selectedFile: '' };

const Form = ({ currentId, setCurrentId, isLoading, user, onOpenAuth }) => {
  const [postData, setPostData] = useState(emptyPost);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const post = useSelector((state) => (
    currentId !== null ? state.posts.find((message) => message._id === currentId) : null
  ));
  const loadedPostId = useRef(null);
  const dispatch = useDispatch();
  const classes = useStyles();

  useEffect(() => {
    if (currentId === null) {
      loadedPostId.current = null;
      setPostData(emptyPost);
      setSubmitError('');
      return;
    }

    if (!post) {
      if (isLoading) {
        return;
      }

      loadedPostId.current = null;
      setPostData(emptyPost);
      setCurrentId(null);
      return;
    }

    if (post.user && post.user.id !== (user && user.id)) {
      loadedPostId.current = null;
      setPostData(emptyPost);
      setCurrentId(null);
      return;
    }

    if (!post.user) {
      loadedPostId.current = null;
      setPostData(emptyPost);
      setCurrentId(null);
      return;
    }

    if (loadedPostId.current !== currentId) {
      loadedPostId.current = currentId;
      setPostData({
        title: post.title || '',
        message: post.message || '',
        tags: Array.isArray(post.tags) ? post.tags.join(', ') : post.tags || '',
        selectedFile: post.selectedFile || '',
      });
      setSubmitError('');
    }
  }, [post, currentId, setCurrentId, isLoading, user]);

  const clear = () => {
    loadedPostId.current = null;
    setCurrentId(null);
    setPostData(emptyPost);
    setSubmitError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentId !== null && !post) {
      setSubmitError('This memory is no longer available. Select another memory or create a new one.');
      setCurrentId(null);
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const postToSave = {
        ...postData,
        tags: typeof postData.tags === 'string'
          ? postData.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
          : postData.tags,
      };

      if (currentId === null) {
        await dispatch(createPost(postToSave));
      } else {
        await dispatch(updatePost(currentId, postToSave));
      }

      clear();
    } catch (error) {
      setSubmitError(error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper className={classes.paper}>
      {!user ? (
        <>
          <Typography variant="h6">Share a memory</Typography>
          <Typography variant="body2" color="textSecondary" style={{ margin: '16px 0' }}>
            Sign in or create an account to post, like, and manage memories.
          </Typography>
          <Button variant="contained" color="primary" fullWidth onClick={() => onOpenAuth('login')}>
            Sign in to continue
          </Button>
        </>
      ) : (
      <form autoComplete="off" noValidate className={`${classes.root} ${classes.form}`} onSubmit={handleSubmit}>
        <Typography variant="h6">
          {currentId === null
            ? 'Creating a Memory'
            : post
              ? `Editing "${post.title}"`
              : 'Selected memory is no longer available'}
        </Typography>
        <Typography variant="body2" color="textSecondary">{user.fullName}</Typography>
        {submitError && <Typography color="error" role="alert">{submitError}</Typography>}
        <TextField name="title" variant="outlined" label="Title" fullWidth required inputProps={{ maxLength: 120 }} value={postData.title} onChange={(e) => setPostData({ ...postData, title: e.target.value })} />
        <TextField name="message" variant="outlined" label="Message" fullWidth required multiline rows={4} inputProps={{ maxLength: 10000 }} value={postData.message} onChange={(e) => setPostData({ ...postData, message: e.target.value })} />
        <TextField name="tags" variant="outlined" label="Tags (comma separated)" fullWidth value={postData.tags} onChange={(e) => setPostData({ ...postData, tags: e.target.value })} />
        <div className={classes.fileInput}><FileBase type="file" multiple={false} onDone={({ base64 }) => setPostData({ ...postData, selectedFile: base64 })} /></div>
        <Button className={classes.buttonSubmit} variant="contained" color="primary" size="large" type="submit" fullWidth disabled={isLoading || isSubmitting || (currentId !== null && !post)}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
        <Button variant="contained" color="secondary" size="small" onClick={clear} fullWidth disabled={isSubmitting}>Clear</Button>
      </form>
      )}
    </Paper>
  );
};

export default Form;
