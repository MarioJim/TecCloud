import type { NextPage } from 'next';
import Head from 'next/head';
import Container from '@mui/material/Container';
import Register from '../src/register/Register';

const SignUp: NextPage = () => (
  <Container>
    <Head>
      <title>TecCloud: Sign Up</title>
      <meta
        name='description'
        content='Store, search and share your documents.'
      />
      <link rel='icon' href='/favicon.ico' />
    </Head>

    <Register />
  </Container>
);

export default SignUp;
