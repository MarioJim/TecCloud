import { Fragment } from 'react';
import Head from 'next/head';
import Typography from '@mui/material/Typography';
import Scaffold from '../components/Scaffold';
import { User, GetServerSideUser, AuthenticatedPage } from '../types';
import { apiServer } from '../config';

export const getServerSideProps: GetServerSideUser = async (ctx) => {
  const res = await fetch(`${apiServer}/user/auth`, {
    credentials: 'include',
    headers: ctx.req.headers as HeadersInit,
  });
  if (res.status === 201) {
    const body = await res.json();
    return {
      props: {
        user: body.user as User,
      },
    };
  }
  return {
    redirect: {
      permanent: false,
      destination: '/login',
    },
  };
};

const Shared: AuthenticatedPage = ({ user }) => (
  <Fragment>
    <Head>
      <title>Shared with me - TecCloud</title>
    </Head>
    <Scaffold user={user}>
      <Typography paragraph>Files shared with me...</Typography>
    </Scaffold>
  </Fragment>
);

export default Shared;
