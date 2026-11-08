import React, { useState } from 'react';
import { Button, Paper, TextField, Typography } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';

import { login, register } from '../../actions/auth';

const Auth = ({ mode, onModeChange, onSuccess }) => {
  const [values, setValues] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();
  const error = useSelector((state) => state.auth.error);
  const isRegistering = mode === 'register';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (isRegistering) {
        await dispatch(register(values));
      } else {
        await dispatch(login({ email: values.email, password: values.password }));
      }

      onSuccess();
    } catch {
      return;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper style={{ maxWidth: 480, margin: '32px auto', padding: 24 }}>
      <Typography variant="h5" gutterBottom>
        {isRegistering ? 'Create your Memories account' : 'Welcome back'}
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        {isRegistering
          ? 'Join the community and start sharing your memories.'
          : 'Sign in to share, like, and manage your memories.'}
      </Typography>
      <form onSubmit={handleSubmit} noValidate>
        {isRegistering && (
          <TextField
            name="fullName"
            label="Full name"
            value={values.fullName}
            onChange={(event) => setValues({ ...values, fullName: event.target.value })}
            autoComplete="name"
            inputProps={{ maxLength: 100 }}
            margin="normal"
            fullWidth
            required
          />
        )}
        <TextField
          name="email"
          label="Email"
          type="email"
          value={values.email}
          onChange={(event) => setValues({ ...values, email: event.target.value })}
          autoComplete="email"
          inputProps={{ maxLength: 254 }}
          margin="normal"
          fullWidth
          required
        />
        <TextField
          name="password"
          label="Password"
          type="password"
          value={values.password}
          onChange={(event) => setValues({ ...values, password: event.target.value })}
          autoComplete={isRegistering ? 'new-password' : 'current-password'}
          inputProps={{ maxLength: 72 }}
          margin="normal"
          fullWidth
          required
        />
        {isRegistering && (
          <TextField
            name="confirmPassword"
            label="Confirm password"
            type="password"
            value={values.confirmPassword}
            onChange={(event) => setValues({ ...values, confirmPassword: event.target.value })}
            autoComplete="new-password"
            inputProps={{ maxLength: 72 }}
            margin="normal"
            fullWidth
            required
          />
        )}
        {error && <Typography color="error" role="alert">{error}</Typography>}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={isSubmitting}
          style={{ marginTop: 16 }}
        >
          {isSubmitting ? 'Please wait...' : isRegistering ? 'Create account' : 'Sign in'}
        </Button>
      </form>
      <Typography variant="body2" align="center" style={{ marginTop: 16 }}>
        {isRegistering ? 'Already have an account?' : 'New to Memories?'}
        {' '}
        <Button color="primary" onClick={() => onModeChange(isRegistering ? 'login' : 'register')}>
          {isRegistering ? 'Sign in' : 'Create account'}
        </Button>
      </Typography>
      <Button fullWidth onClick={() => onModeChange(null)}>Back to memories</Button>
    </Paper>
  );
};

export default Auth;
