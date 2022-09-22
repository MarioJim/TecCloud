import type { NextPage } from 'next';
import { Fragment } from 'react';
import Head from 'next/head';
import Typography from '@mui/material/Typography';
import Scaffold from '../components/Scaffold';

const Settings: NextPage = () => (
  <Fragment>
    <Head>
      <title>Settings - TecCloud</title>
    </Head>
    <Scaffold>
      <Typography paragraph>My settings...</Typography>
    </Scaffold>
  </Fragment>
);

export default Settings;
