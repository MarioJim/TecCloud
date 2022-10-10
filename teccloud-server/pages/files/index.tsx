import type { GetServerSideUser } from '../../types';
import { Fragment } from 'react';
import Head from 'next/head';
import { apiServer } from '../../config';

/// Should always redirect somewhere
export const getServerSideProps: GetServerSideUser = async (ctx) => {
  const res = await fetch(`${apiServer}/user/auth`, {
    credentials: 'include',
    headers: ctx.req.headers as HeadersInit,
  });
  if (res.status === 201) {
    const body = await res.json();
    return {
      redirect: {
        destination: `/files/${body.user.folderId}`,
        permanent: true,
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

const LoadingFiles = () => (
  <Fragment>
    <Head>
      <title>Files - TecCloud</title>
    </Head>
    <p>Loading...</p>
  </Fragment>
);

export default LoadingFiles;
