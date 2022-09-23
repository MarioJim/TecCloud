import type { NextPage } from 'next';
import Head from 'next/head';
import Container from '@mui/material/Container';
import Login from '../src/login/Login';
import axios from 'axios';

export const getServerSideProps = async (ctx: { req: { headers: any } }) => {
  const headers = ctx.req.headers;
  try {
    const res = await axios.get('http://localhost:3001/user/auth', {
      headers,
      withCredentials: true,
    });
    return {
      redirect: {
        permanent: false,
        destination: '/files',
      },
      props: {},
    };
  } catch (error) {
    return { props: {} };
  }
};

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

    <Login />
  </Container>
);

export default SignUp;
