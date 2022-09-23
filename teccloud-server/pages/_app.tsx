import type { AppProps } from 'next/app';
import { Fragment } from 'react';
import Head from 'next/head';
import CssBaseline from '@mui/material/CssBaseline';

const MyApp = ({ Component, pageProps }: AppProps) => (
  <Fragment>
    <Head>
      <meta
        name='description'
        content='Store, search and share your documents.'
      />
      <link rel='icon' href='/favicon.ico' />
    </Head>
    <CssBaseline />
    <Component {...pageProps} />
  </Fragment>
);

export default MyApp;
