import { Fragment, useCallback, useState } from 'react';
import Head from 'next/head';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { DropEvent, FileRejection, useDropzone } from 'react-dropzone';
import Scaffold from '../components/Scaffold';
import { GetServerSideUser, AuthenticatedPage, User } from '../types';

export const getServerSideProps: GetServerSideUser = async (ctx) => {
  const res = await fetch('http://localhost:3001/user/auth', {
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

const Files: AuthenticatedPage = ({ user }) => {
  const [lastFilesDropped, setLastFilesDropped] = useState<string[]>([]);
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const formData = new FormData();
    formData.set('folderId', `${user.folderId}`);
    acceptedFiles.forEach((file) => formData.append('files', file));
    const response = await fetch('http://localhost:3001/files/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    const jsonRes = await response.json();
    if (response.status !== 201) {
      console.error('Error uploading files:', jsonRes);
      return;
    }
    setLastFilesDropped(
      jsonRes.files.map((f: any) => JSON.stringify(f, null, 2)),
    );
  }, []);
  const { getInputProps, getRootProps, isDragActive } = useDropzone({ onDrop });

  return (
    <Fragment>
      <Head>
        <title>Files - TecCloud</title>
      </Head>
      <Scaffold user={user}>
        <Box
          sx={{
            width: '100%',
            minHeight: 'calc(100vh - 112px)',
            bgcolor: isDragActive ? 'primary.main' : 'background.default',
          }}
          {...getRootProps()}
        >
          <Typography paragraph>My files...</Typography>
          <input {...getInputProps()} />
          {isDragActive ? (
            <Typography paragraph>Now drop it!</Typography>
          ) : (
            <Typography paragraph>Drop a file here!</Typography>
          )}
          {lastFilesDropped.map((file, i) => (
            <div key={i}>
              <Typography paragraph>Uploaded file</Typography>
              <pre>{file}</pre>
            </div>
          ))}
        </Box>
      </Scaffold>
    </Fragment>
  );
};

export default Files;
