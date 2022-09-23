import type { NextPage, GetServerSideProps } from 'next';
import Head from 'next/head';
import Container from '@mui/material/Container';
import Register from '../src/register/Register';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const res = await fetch('http://localhost:3001/user/auth', {
    credentials: 'include',
    headers: ctx.req.headers as HeadersInit,
  });
  if (res.status === 201) {
    return {
      redirect: {
        permanent: false,
        destination: '/files',
      },
    };
  }
  return { props: {} };
};

const SignUp: NextPage = () => (
  <Container>
    <Head>
      <title>Sign Up - TecCloud</title>
    </Head>

    <Register />
  </Container>
);

export default SignUp;
