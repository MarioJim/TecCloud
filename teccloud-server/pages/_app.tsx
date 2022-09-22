import type { AppProps } from 'next/app';
import { Fragment } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import '../styles/globals.css';

const MyApp = ({ Component, pageProps }: AppProps) => (
  <Fragment>
    <CssBaseline />
    <Component {...pageProps} />
  </Fragment>
);

export default MyApp;
