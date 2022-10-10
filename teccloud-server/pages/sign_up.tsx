import type { NextPage, GetServerSideProps } from 'next';
import Head from 'next/head';
import Container from '@mui/material/Container';
import SignUp from '../components/SignUp';
import { apiServer } from '../config';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const res = await fetch(`${apiServer}/user/auth`, {
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

const SignUpPage: NextPage = () => (
  <Container>
    <Head>
      <title>Sign Up - TecCloud</title>
    </Head>

    <SignUp />
  </Container>
);

export default SignUpPage;
