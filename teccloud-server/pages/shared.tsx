import type { NextPage } from 'next';
import { Fragment } from 'react';
import Head from 'next/head';
import Typography from '@mui/material/Typography';
import Scaffold from '../components/Scaffold';

const Shared: NextPage = () => (
  <Fragment>
    <Head>
      <title>Shared with me - TecCloud</title>
    </Head>
    <Scaffold>
      <Typography paragraph>Files shared with me...</Typography>
    </Scaffold>
  </Fragment>
);

export default Shared;
