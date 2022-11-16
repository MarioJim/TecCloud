import { Fragment, useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Head from 'next/head';
import Typography from '@mui/material/Typography';
import Scaffold from '../components/Scaffold';
import SingleFile from '../components/SingleFile';
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

const Shared: AuthenticatedPage = ({ user }) => {
  const [sharedFiles, setSharedFiles] = useState<any[]>([]);
  useEffect(() => {
    const fetchFiles = async () => {
      const filesResponse = await fetch(`${apiServer}/files/shared`, {
        method: 'get',
        credentials: 'include',
      });
      const filesJson = await filesResponse.json();
      setSharedFiles(filesJson);
    };
    fetchFiles().catch(console.error);
  }, []);

  return (
    <Fragment>
      <Head>
        <title>Shared with me - TecCloud</title>
      </Head>
      <Scaffold user={user}>
        <Typography paragraph>Files shared with me...</Typography>
        <Box
          sx={{
            maxWidth: 'calc(100vw - 300px)',
            minHeight: 'calc(100vh - 112px)',
          }}
        >
          {sharedFiles.map((file) => (
            <SingleFile
              key={file.id}
              fileId={file.id}
              folderId={file.folderId}
              fileName={file.fileName}
              originalName={file.originalName}
              accessByLink={file.accessByLink}
              users={file.users}
              ownerId={file.file_access.ownerId}
              currentUser={user}
            />
          ))}
        </Box>
      </Scaffold>
    </Fragment>
  );
};

export default Shared;
