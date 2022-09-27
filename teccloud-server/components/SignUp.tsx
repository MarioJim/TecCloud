import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Link from 'next/link';
import axios from 'axios';

type ErrorResponse = {
  error: string;
};

export default function SignUp() {
  const onSubmit: (e: React.FormEvent) => void = async (e) => {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      firstName: { value: string };
      lastName: { value: string };
      username: { value: string };
      password: { value: string };
    };

    const inputs = {
      firstName: target.firstName.value,
      lastName: target.lastName.value,
      username: target.username.value,
      password: target.password.value,
    };

    try {
      const response = await axios.post(
        'http://localhost:3001/user/register',
        inputs,
        { withCredentials: true },
      );
      sessionStorage.setItem('user', JSON.stringify(response.data.user));
      location.assign('/files');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        alert((err.response?.data as ErrorResponse).error);
      }
    }
  };

  return (
    <Box
      component='div'
      display='flex'
      justifyContent='center'
      alignItems='center'
      minHeight='100vh'
    >
      <Stack
        component='form'
        sx={{
          '& .MuiFormControl-root': { my: 1 },
          p: 3,
          borderRadius: 2,
          bgcolor: 'white',
          maxWidth: '100%',
        }}
        onSubmit={onSubmit}
      >
        <TextField
          required
          fullWidth
          name='firstName'
          id='firstName'
          label='First name'
        />
        <TextField
          required
          fullWidth
          name='lastName'
          id='lastName'
          label='Last name'
        />
        <TextField
          required
          fullWidth
          name='username'
          id='username'
          label='Username'
        />
        <TextField
          required
          fullWidth
          name='password'
          id='password'
          label='Password'
          type='password'
          inputProps={{ pattern: '(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}' }}
          helperText='At least 8 characters, 1 uppercase, 1 lowercase y 1 number.'
        />

        <Button variant='contained' size='large' type='submit' sx={{ mb: 1 }}>
          Create account
        </Button>
        <Link href='/login'>
          <Button
            variant='contained'
            color='secondary'
            size='large'
            type='submit'
          >
            Go to login
          </Button>
        </Link>
      </Stack>
    </Box>
  );
}
