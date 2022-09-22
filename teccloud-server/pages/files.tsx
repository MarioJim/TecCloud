import type { NextPage } from 'next';
import { Fragment } from 'react';
import Head from 'next/head';
import axios from 'axios';
import Typography from '@mui/material/Typography';
import Scaffold from '../components/Scaffold';

export const getServerSideProps = async (ctx: { req: { headers: any } }) => {
  const headers = ctx.req.headers;
  try {
    const res = await axios.get('http://localhost:3001/user/auth', {
      headers,
      withCredentials: true,
    });
    return { props: {} };
  } catch (error) {
    return {
      redirect: {
        permanent: false,
        destination: '/login',
      },
      props: {},
    };
  }
};

const Files: NextPage = () => (
  <Fragment>
    <Head>
      <title>Files - TecCloud</title>
    </Head>
    <Scaffold>
      <Typography paragraph>My files...</Typography>
    </Scaffold>
  </Fragment>
);

export default Files;
